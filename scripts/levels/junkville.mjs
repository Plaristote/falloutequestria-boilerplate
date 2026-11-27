import {LevelBase} from "./base.mjs";
import NegociationAssembly from "../scenes/junkville/negociationAssembly.mjs";
import {
  helpfulDisappearDelay,
  findHelpfulRescueRouteState,
  finalizeRescueRoute
} from "../quests/junkville/findHelpful.mjs";
import {HelpfulReturnScene} from "../scenes/junkville/helpfulReturn.mjs";
import {sayChatter, gatherStragglers} from "../characters/junkville/assembly.mjs";

class Level extends LevelBase {
  constructor(model) {
    super(model);
    console.log("JUNKVILLE constructor");
  }

  initialize() {
    console.log("JUNKVILLE initialize");
    level.tasks.addTask("delayedInitialize", 1, 1);
  }

  delayedInitialize() {
    game.dataEngine.setFactionReputationEnabled("junkville", true);
  }

  prepareRathian() {
    const rathian = game.getCharacter("rathian");
    const door = level.findObject("smith.door-entrance");
    const shouldBeHere = rathian && rathian.script.shouldBeAtJunkville;
    let isHere = level.findObject("Rathian#0");

    if (!rathian) {
      console.log("Error: character rathian does not exist, and that should not be possible");
      return ;
    }
    if (!shouldBeHere && isHere) {
      game.uniqueCharacterStorage.detachCharacter(rathian);
      isHere = false;
    }
    if (rathian.scriptName == "rathian/meeting.mjs") {
      rathian.script.insertedIntoZone();
    }
    else if (shouldBeHere && rathian.isAlive()) {
      game.uniqueCharacterStorage.loadCharacterToCurrentLevel("rathian", 53, 27, 0);
      if (rathian.scriptName == "rathian/meeting.mjs")
        rathian.script.talkOnArrival();
      rathian.setScript("rathian/junkville.mjs");
      rathian.attacksOnSight = true;
      rathian.movementMode = "walking";
      rathian.statistics.faction = "rathian";
      rathian.tasks.removeTask("autopilot");
      if (door) door.locked = false;
    } else if (door && !isHere && rathian.isAlive()) {
      door.opened = false;
      door.locked = true;
    }
  }

  prepareCook() {
    const cook = game.uniqueCharacterStorage.getCharacter("junkville-cook");

    if (cook && cook.script.shouldBeAtJunkville()) {
      game.uniqueCharacterStorage.loadCharacterToCurrentLevel("junkville-cook", 32, 6, 0);
      cook.setScript("junkville/cook.mjs");
      cook.movementMode = "walking";
    } else {
      console.log("Damned, where is cook ??");
    }
  }

  goToUndergroundBattle() {
    game.switchToLevel("junkville-underground", "battle-entry");
  }

  goToBanditsRaid() {
    game.switchToLevel("junkville-cavern", "bandits-camp-entry");
  }

  get negociationScene() {
    if (!this._negociationScene)
      this._negociationScene = new NegociationAssembly(this);
    return this._negociationScene;
  }

  onLoaded() {
    this.helpfulReturnScene = new HelpfulReturnScene(this);
    super.onLoaded();
    level.tasks.addUniqueTask("assemblyChatter", 3500, 0);
    this.prepareRathian();
    this.prepareCook();
    if (findHelpfulRescueRouteState() == 3)
      finalizeRescueRoute();
  }

  onExit() {
    this.prepareJunkvilleDisappearence();
  }

  prepareJunkvilleDisappearence() {
    const character = level.findObject("helpful-copain");

    if (character && character.hasVariable("met") && !character.hasVariable("disappeared")) {
      character.script.helpfulDisappear();
    }
  }

  setupNegociationAssembly() {
    const nextAssemblyEnd = game.timeManager.secondsUntilTime({ hour: 23 });
    level.setVariable("nextAssemblyEnd", game.timeManager.getTimestamp() + nextAssemblyEnd);
    level.tasks.addUniqueTask("waitForAssembly", 5 * 1000, 0);
  }

  // Ambient chatter at the communal assembly (9pm - 11pm), except while the
  // quest-related debate is playing - it has its own scripted lines.
  assemblyChatter() {
    const hour = game.timeManager.hour;

    if (hour < 21 || hour >= 23 || level.combat) return ;
    gatherStragglers()
    if (this.negociationScene.active || Math.random() > 0.65) return ;
    sayChatter();
  }

  waitForAssembly() {
    if (level.getVariable("nextAssemblyEnd") < game.timeManager.getTimestamp()) {
      const participants = level.find(character => {
        return character.type == "Character" && character.statistics.faction === "junkville";
      });

      level.tasks.removeTask("waitForAssembly");
      this.negociationScene.autoConclude(participants);
    } else if (game.timeManager.hour >= 21) {
      const actors = this.negociationScene.generateActors();
      const participants = level.find(character => {
        return character.type == "Character" && character.statistics.faction === "junkville";
      });
      // Minutes elapsed since 9pm. (Don't rely on `minute` alone: it wraps every hour.)
      const waited = (game.timeManager.hour - 21) * 60 + game.timeManager.minute;
      const everyoneIdle = participants.every(participant => participant.actionQueue.isEmpty());
      const enoughGathered = actors.length >= participants.length - 1;

      // Normally wait for everyone to settle. But a single villager with a stuck
      // or endless action queue must not hold the assembly hostage forever.
      if ((everyoneIdle && (enoughGathered || waited >= 2)) || waited >= 10) {
        level.tasks.removeTask("waitForAssembly");
        this.negociationScene.initialize();
      }
      return ;
    }
  }
}

export function create(model) {
  return new Level(model);
}
