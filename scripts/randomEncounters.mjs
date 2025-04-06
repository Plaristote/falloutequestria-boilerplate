import {getValueFromRange} from "behaviour/random.mjs";
import {skillCheck} from "cmap/helpers/checks.mjs";

const RandomEncounterChart = {
  None:     0,
  Friendly: 1,
  Hostile:  2,
  Special:  3,
  Dungeon:  4
};

class OutdoorsmanCheck {
  constructor(party, groups) {
    this.party = party;
    this.groups = groups;
    this.success = false;
    this.character = party.mostSkilledAt("outdoorsman");
  }

  run() {
    console.log("running OutdoorsmanCheck against", this.groups.length, "groups");
    for (let i = 0 ; i < this.groups.length ; ++i) {
      if (this.checkGroup(this.groups[i])) break ;
    }
  }

  checkGroup(group) {
    this.success = skillCheck(this.character, "outdoorsman", {
      target: group.avoidRoll,
      dice: 20
    });
    if (this.success)
      this.gainExperience(group);
    return this.success;
  }

  gainExperience(group) {
    console.log("DONE. Gaining experience now");
    const reward = group.avoidRoll / 7;
    party.addExperience(reward);
    game.appendToConsole(i18n.t("messages.encounter-avoid-roll-success", {
      xp: reward
    }));
  }
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

    console.log("encounter roll", roll);
    if (roll == 42)
      return RandomEncounterChart.Special;
    else if (roll >= 100 && roll <= 115)
      return RandomEncounterChart.Dungeon;
    else if (roll >= 3200 && roll <= 3350)
      return RandomEncounterChart.Hostile;
    else if (roll >= 14900)
      return RandomEncounterChart.Friendly;
    return RandomEncounterChart.None;
  }

  triggerHostileEncounter() {
    const desertMaps = ["random-desert-1", "random-desert-2", "random-desert-cabin"];
    const desertEasyEncounters = [
      function(difficultyRoll) { return { "name": "Rats", "members": [{"sheet": "mutatedRat", "script": "rat.mjs", "avoidRoll": (80 + difficultyRoll / 4), "amount": Math.max(3, Math.floor(4 * (difficultyRoll / 40)))}] }; },
      function(difficultyRoll) { return { "name": "Scorpions", "members": [{"sheet": "scorpion", "script": "scorpion.mjs", "avoidRoll": (80 + difficultyRoll / 4), "amount": Math.max(3, Math.floor(4 * (difficultyRoll / 40)))}] }; }
    ];
    const candidateMaps       = desertMaps;
    const candidateEncounters = desertEasyEncounters;
    const mapRoll             = getValueFromRange(0, candidateMaps.length - 1);
    const encounterRoll       = getValueFromRange(0, candidateEncounters.length - 1);
    const difficultyRoll      = getValueFromRange(0, 100);

    console.log("encounterRoll", encounterRoll);
    const enemyParty1 = candidateEncounters[encounterRoll](difficultyRoll);
    enemyParty1.zone = "encounter-zone-1";
    console.log("encounterRoll", encounterRoll, enemyParty1.name, enemyParty1.members[0].amount);

    const avoidable = new OutdoorsmanCheck(game.playerParty, [enemyParty1]);
    avoidable.run();

    game.randomEncounters.prepareEncounter(candidateMaps[mapRoll], {
      "optional": avoidable.success,
      "title": "danger",
      "parties": [enemyParty1]
    });
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
