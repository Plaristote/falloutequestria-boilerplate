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

  get caravanQuest() {
    return game.quests.getQuest("thornhoof/caravan");
  }

  get unlawfullyEntered() {
    return game.getVariable("unlawfullyEnteredThornhoof", 0) == 1;
  }

  set unlawfullyEntered(value) {
    game.setVariable("unlawfullyEnteredThornhoof", value ? 1 : 0);
  }

  loadCaravanIntoCity() {
    if (this.caravanQuest.script.caravanInProgress)
      this.caravanQuest.completeObjective("lead-caravan");
    super.loadCaravanIntoCity();
  }

  onZoneEntered(zoneName, character) {
    if (zoneName == "authorized-zone") {
      this.unlawfullyEntered = false;
    } else if (zoneName == "forbidden-zone" && !this.caravanQuest.completed) {
      this.unlawfullyEntered = true;
    }
  }
}
