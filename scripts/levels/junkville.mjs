import {LevelBase} from "./base.mjs";
import {
  findHelpfulRescueRouteState,
  finalizeRescueRoute
} from "../quests/junkville/findHelpful.mjs";

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
    const rathian = game.uniqueCharacterStorage.getCharacter("rathian");

    if (rathian && rathian.script.shouldBeAtJunkville) {
      game.uniqueCharacterStorage.loadCharacterToCurrentLevel("rathian", 53, 27, 0);
      rathian.setScript("rathian/junkville.mjs");
      rathian.movementMode = "walking";
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

  onLoaded() {
    this.prepareRathian();
    this.prepareCook();
    if (findHelpfulRescueRouteState() == 3)
      finalizeRescueRoute();
  }

  onExit() {
    this.prepareJunkvilleDisappearence();
  }

  prepareJunkvilleDisappearence() {
    const character = level.findObject("house-copain.copain");

    if (character && !character.hasVariable("disappeared")) {
      character.tasks.removeTask("prepareDisappear");
      character.tasks.addTask("prepareDisappear", 172800 * 1000, 1);
    }
  }
}

export function create(model) {
  return new Level(model);
}
