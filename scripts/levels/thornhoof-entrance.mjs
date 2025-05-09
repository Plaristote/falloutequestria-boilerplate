import {LevelBase} from "./base.mjs";

export default class extends LevelBase {
  get storedSilvertide() {
    return game.uniqueCharacterStorage.getCharacter("thornhoof/silvertide");
  }

  onLoaded() {
    super.onLoaded();
    if (this.storedSilvertide?.script?.shouldBeAtThornhoofEntrance)
      game.uniqueCharacterStorage.loadCharacterToCurrentLevel("thornhoof/silvertide", 26, 7, 0);
  }

  loadCaravanIntoCity() {
    const quest = game.quests.getQuest("thornhoof/caravan");
    if (quest.script.caravanInProgress)
      quest.completeObjective("lead-caravan");
    super.loadCaravanIntoCity();
  }
}
