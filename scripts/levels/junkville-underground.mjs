import {LevelBase} from "./base.mjs";
import {
  hasBattleStarted,
  initializeBattle,
  finalizeBattle,
  clearBattle,
  safeObjectiveCompleted,
  shouldAltLeaderTakeOver,
  makeAltLeaderTakeOver,
  prepareDiamondDogsOnCavernAccessTransgression
} from "../quests/junkvilleNegociateWithDogs.mjs";
import {
  captiveReleaseAuthorized,
  areCaptorsDead
} from "../quests/junkvilleDumpsDisappeared.mjs";
import {
  findHelpfulRescueRouteState
} from "../quests/junkville/findHelpful.mjs";

export class JunkvilleUnderground extends LevelBase {
  onLoaded() {
    if (game.getVariable("junkville-dog-hole") === true) {
      level.tasks.addTask("onFellIntoHole", 100, 1);
      game.unsetVariable("junkville-dog-hole");
    }
    if (game.getVariable("junkvilleUndergroundBattle") === true) {
      initializeBattle();
      game.unsetVariable("junkvilleUndergroundBattle");
      game.setVariable("ongoingJunkvilleUndergroundBattle", true);
    }
    if (findHelpfulRescueRouteState() == 2)
      prepareDiamondDogsOnCavernAccessTransgression();
  }

  onFellIntoHole() {
    const guard = level.findObject("pack.guard");

    guard.getScriptObject().investigatePlayerFall();
  }

  onExit() {
    if (level.getVariable("captive-released") === true || (level.getVariable("captive-escaping") && areCaptorsDead()))
      this.clearLiveCaptives();
    else if (level.getVariable("captive-escaping") && !areCaptorsDead())
      this.killLiveCaptives();
    if (game.getVariable("ongoingJunkvilleUndergroundBattle"))
      this.clearBattle();
    if (shouldAltLeaderTakeOver())
      this.altLeaderTakesOver();
    safeObjectiveCompleted();
  }

  get diamondDogs() {
    const group = level.findGroup("pack");
    const result = [level.findObject("dog-leader"), level.findObject("dog-alt-leader")];

    for (let i = 0 ; i < group.objects.length ; ++i)
      result.push(group.objects[i]);
    return result;
  }

  get captives() {
    return level.findGroup("captives");
  }

  get liveDiamondDogs() {
    const result = [];

    this.diamondDogs.forEach(dog => {
      if (dog.isAlive())
        result.push(dog);
    });
    return result;
  }

  get liveCaptives() {
    const captives = this.captives;
    const result = [];

    for (var i = 0 ; i < captives.objects.length ; ++i) {
      if (captives.objects[i].isAlive())
        result.push(captives.objects[i]);
    }
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

  closestDogs(target) {
    return this.liveDiamondDogs.sort(function(a, b) {
      return a.getDistance(target) - b.getDistance(target);
    });
  }

  sendCaptivesToExit() {
    if (captiveReleaseAuthorized()) {
      level.setVariable("captive-released", true);
    } else {
      level.setVariable("captive-escaping", true);
      game.diplomacy.setAsEnemy(true, "junkville", "diamond-dogs");
      game.diplomacy.setAsEnemy(true, "player", "diamond-dogs");
    }
    this.liveCaptives.forEach(captive => {
      captive.tasks.addUniqueTask("reachExitZone", 1500, 0);
    });
  }

  clearLiveCaptives() {
    level.unsetVariable("captive-escaping");
    this.liveCaptives.forEach(captive => {
      captive.script.onSaved();
    });
  }

  killLiveCaptives() {
    this.liveCaptives.forEach(captive => {
      captive.takeDamage(captive.statistics.hitPoints, null);
    });
  }

  onDogDied() {
    console.log("onDogDied", this.liveDiamondDogs.length);
    if (this.liveDiamondDogs.length == 0) {
      game.setVariable("junkvilleDogsWipedOut", 1);
      if (hasBattleStarted())
        this.onBattleEnded();
    }
  }

  onBattleEnded() {
    console.log("onBattleEnded");
    finalizeBattle({
      survivors: {
        dogs: this.liveDiamondDogs,
        junkville: this.liveJunkvilleCombattants,
        captives: this.liveCaptives
      }
    });
  }

  clearBattle() {
    console.log("clearBattle");
    game.unsetVariable("ongoingJunkvilleUndergroundBattle");
    clearBattle({
      survivors: {
        dogs: this.liveDiamondDogs,
        junkville: this.liveJunkvilleCombattants,
        captives: this.liveCaptives
      }
    });
  }

  altLeaderTakesOver() {
    console.log("altLeaderTakesOver");
    const altLeader = level.findObject("dog-alt-leader");
    const leader = level.findObject("dog-leader");

    leader.takeDamage(9999, null);
    makeAltLeaderTakeOver();
    this.liveCaptives.forEach(captive => {
      captive.takeDamage(9999, null);
    });
  }

  reactToAltLeaderDuelDefeat() {
    console.log("reactToAltLeaderDuelDefeat");
    const altLeader = level.findObject("dog-alt-leader");
    const leader = level.findObject("dog-leader");
    const nearbyDogs = this.closestDogs(altLeader).filter(dog => dog != leader);

    if (nearbyDogs.length >= 2) {
      nearbyDogs[0].actionQueue.pushWait(1);
      nearbyDogs[0].actionQueue.pushSpeak(i18n.t("junkville.dogs.dogA-reactToDuelDefeat"), 3200, "red");
      nearbyDogs[1].actionQueue.pushWait(2);
      nearbyDogs[1].actionQueue.pushSpeak(i18n.t("junkville.dogs.dogB-reactToDuelDefeat"), 3800, "yellow");
      nearbyDogs[0].actionQueue.start();
      nearbyDogs[1].actionQueue.start();
      leader.actionQueue.pushWait(3);
    } else {
      leader.actionQueue.pushWait(1);
    }
    leader.actionQueue.pushSpeak(i18n.t("junkville.dogs.leaderReactToDuelDefeat"), 8000, "lightblue");
    leader.actionQueue.start();
  }
}
