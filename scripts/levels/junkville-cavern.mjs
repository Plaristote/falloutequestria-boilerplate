import {getValueFromRange} from "../behaviour/random.mjs";
import {AcidZoneEffect} from "./components/acidZoneEffect.mjs";
import {HelpfulRescueScene} from "../scenes/junkville/helpfulRescue.mjs";
import {
  helpfulHasDisappeared,
  helpfulExitCavernHook,
  findHelpfulRescueRouteState
} from "../quests/junkville/findHelpful.mjs";
import {
  hasBanditsRaidStarted,
  initializeBanditsRaid,
  finalizeBanditsRaid,
  clearBanditsRaid,
  onBanditsWipedOutIndependently,
  onEnteredBanditsCavern
} from "../quests/junkville/cavernBandits.mjs";

import killArray from "../characters/killArray.mjs";

export default class JunkvilleCavern {
  constructor(model) {
    this.model = model;
    this.acidZone = new AcidZoneEffect(this, {
      zone: level.tilemap.getZone("acid-zone"),
      scope: "acidZone", interval: 3000
    });
  }

  initialize() {
    this.acidZone.enable();
  }

  onLoaded() {
    if (helpfulHasDisappeared()) this.prepareHelpful();
    if (findHelpfulRescueRouteState() === 1) this.prepareHelpfulRescue();
    if (this.liveBandits.length > 0) {
      game.diplomacy.setAsEnemy(true, "player", "cavern-bandits");
      game.diplomacy.setAsEnemy(true, "junkville", "cavern-bandits");
    }
    if (game.getVariable("junkvilleBanditsRaid") === true) {
      initializeBanditsRaid();
      game.unsetVariable("junkvilleBanditsRaid");
      game.setVariable("ongoingJunkvilleBanditsRaid", true);
    }
  }

  onZoneEntered(zoneName, character) {
    this.acidZone.onZoneEntered(zoneName, character);
    if (character === game.player) {
      switch (zoneName) {
        case "world-exit":
          if (helpfulExitCavernHook()) return true;
          break ;
        case "bandits-camp":
          onEnteredBanditsCavern();
          return true;
      }
    }
    return false;
  }

  onExit() {
    if (game.getVariable("ongoingJunkvilleBanditsRaid"))
      this.clearBanditsRaid();
  }

  prepareHelpful() {
    const character = game.uniqueCharacterStorage.getCharacter("helpful-copain");
    if (character) {
      game.uniqueCharacterStorage.loadCharacterToCurrentLevel("helpful-copain", 26, 21);
      character.statistics.hitPoints = Math.min(character.statistics.hitPoints, 12);
      character.setAnimation("fall");
    }
  }

  prepareHelpfulRescue() {
    this.scene = new HelpfulRescueScene(this);
    this.scene.initialize();
    game.quests.getQuest("junkville/findHelpful").setVariable("rescue-route", 2);
    console.log("quest initialized");
  }

  //
  // Bandits raid
  //
  get bandits() {
    return level.findGroup("bandits");
  }

  get liveBandits() {
    const result = [];
    this.bandits.objects.forEach(bandit => {
      if (bandit.isAlive())
        result.push(bandit);
    });
    return result;
  }

  get junkvilleCombattants() {
    const result = [];

    for (let i = 0 ; i < level.objects.length ; ++i) {
      const object = level.objects[i];
      if (object.getObjectType() === "Character" && object.statistics.faction === "junkville")
        result.push(object);
    }
    return result;
  }

  get liveJunkvilleCombattants() {
    const result = [];
    this.junkvilleCombattants.forEach(character => {
      if (character.isAlive())
        result.push(character);
    });
    return result;
  }

  get liveDogAllies() {
    const result = [];

    for (let i = 0 ; i < level.objects.length ; ++i) {
      const object = level.objects[i];
      if (object.getObjectType() === "Character"
          && object.statistics.faction === "diamond-dogs"
          && object.isAlive())
        result.push(object);
    }
    return result;
  }

  onBanditDied() {
    console.log("onBanditDied", this.liveBandits.length);
    if (this.liveBandits.length > 0)
      return;
    if (hasBanditsRaidStarted() && game.getVariable("ongoingJunkvilleBanditsRaid"))
      this.onRaidEnded();
    else
      onBanditsWipedOutIndependently();
  }

  onRaidEnded() {
    console.log("onRaidEnded");
    finalizeBanditsRaid({
      victory: true,
      survivors: {
        bandits: this.liveBandits,
        junkville: this.liveJunkvilleCombattants,
        dogs: this.liveDogAllies
      }
    });
  }

  clearBanditsRaid() {
    const survivors = {
      bandits: this.liveBandits,
      junkville: this.liveJunkvilleCombattants,
      dogs: this.liveDogAllies
    };
    const victory = survivors.bandits.length <= survivors.junkville.length + survivors.dogs.length;

    console.log("clearBanditsRaid, victory=", victory);
    game.unsetVariable("ongoingJunkvilleBanditsRaid");
    finalizeBanditsRaid({ survivors, victory });
    clearBanditsRaid({ survivors, victory });
    console.log("clearBanditsRaid done");
  }
}
