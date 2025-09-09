import {getValueFromRange} from "behaviour/random.mjs";
import {skillCheck} from "cmap/helpers/checks.mjs";
import OutdoorsCheck from "worldmap/outdoorsCheck.mjs";
import {generateHostileEncounter} from "worldmap/hostileEncounters.mjs";
import {generateEncounterLevel} from "worldmap/encounterLevels.mjs";

const RandomEncounterChart = {
  None:     0,
  Friendly: 1,
  Hostile:  2,
  Special:  3,
  Dungeon:  4
};

function encounterTitleForParties(parties) {
  let title = '';

  for (let i = 0 ; i < parties.length ; ++i) {
    if (i > 0) {
      if (i + 1 >= parties.length)
        title += i18n.t("randomEncounters.and")
      else
        title += ", ";
    }
    title += i18n.t(`randomEncounters.names.${parties[i].name}`);
  }
  return title;
}

export class RandomEncounterComponent {
  constructor() {
    this.outdoorElapsedTime = 0;
  }
	
  outdoorsTick(minutes) {
    this.outdoorElapsedTime += minutes;
    if (this.outdoorElapsedTime >= 30) {
      this.randomEncounterTrigger();
      this.outdoorElapsedTime = 0;
    }
  }

  randomEncounterTrigger() {
    if (!game.worldmap.getCurrentCity()) {
      switch (this.randomEncounterCheck()) {
      case RandomEncounterChart.Friendly:
        this.triggerFriendlyEncounter();
        break ;
      case RandomEncounterChart.Hostile:
        this.triggerHostileEncounter();
        break ;
      case RandomEncounterChart.Special:
        console.log("/!!\\ SPECIAL ENCOUNTER (none implemented yet though)");
        break ;
      case RandomEncounterChart.Dungeon:
        console.log("/!!\\ FOUND A DUNGEON (none implemented yet though)");
        break ;
      }
    }
  }

  randomEncounterCheck() {
    const roll = getValueFromRange(0, 15000);
    const hostileProbabilities = this.hostileEncounterProbabilities();

    console.log("encounter roll", roll);
    if (roll == 42)
      return RandomEncounterChart.Special;
    else if (roll >= 100 && roll <= 115)
      return RandomEncounterChart.Dungeon;
    else if (roll >= hostileProbabilities[0] && roll <= hostileProbabilities[1])
      return RandomEncounterChart.Hostile;
    else if (roll >= 14900)
      return RandomEncounterChart.Friendly;
    return RandomEncounterChart.None;
  }

  hostileEncounterProbabilities() {
    const zones = game.worldmap.getCurrentZones();
    if (zones.indexOf("golden-horde-siege") >= 0)
      return [3200, 5000];
    else if (zones.indexOf("capital-surroundings") >= 0)
      return [3200, 4500];
    return [3200, 4000];
  }

  hostileEncounterTruceDuration() {
    const zones = game.worldmap.getCurrentZones();
    let hours = 12;
    if (zones.indexOf("golden-horde-siege") >= 0)
      hours = 5;
    else if (zones.indexOf("capital-surroundings") >= 0)
      hours = 8;
    return 60 * 60 * hours;
  }

  triggerHostileEncounter() {
    const parties = generateHostileEncounter();
    const lastTimestamp = game.getVariable("lastHostileEncounter", 0);

    if (game.timeManager.getTimestamp() - lastTimestamp < this.hostileEncounterTruceDuration()) {
      console.log("RandomEncounters: triggerHostileEncounter has been caught trying to harass the player. Canceled.");
      return ;
    } else {
      console.log("RandomEncounters: allowed:", game.timeManager.getTimestamp(), '-', lastTimestamp, '<', this.hostileEncounterTruceDuration());
    }
    game.setVariable("lastHostileEncounter", game.timeManager.getTimestamp());
    if (parties.length > 0) {
      const level     = generateEncounterLevel();
      const avoidable = new OutdoorsCheck(game.playerParty, parties);

      avoidable.run();
      game.randomEncounters.prepareEncounter(level, {
        "optional": avoidable.success,
        "title":    encounterTitleForParties(parties),
        "parties":  parties
      });
    } else {
      console.log("RandomEncounters: failed to trigger hostile encounter, could not generate a hostile CharacterParty");
    }
  }

  triggerFriendlyEncounter() {
    const desertMaps = ["random-desert-cabin"];
    const candidateMaps       = desertMaps;
    const mapRoll             = getValueFromRange(0, candidateMaps.length - 1);

    game.randomEncounters.prepareEncounter(candidateMaps[mapRoll], {
      "optional": true,
      "title": i18n.t(`worldmap.places.${candidateMaps[mapRoll]}`)
    });
  }
}
