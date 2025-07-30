import {OwnedStorage} from "../../ownedStorage.mjs";

export default class Desk extends OwnedStorage {
  get quest() {
    return game.quests.getQuest("cristal-den/pimp-changeling");
  }

  get storageOwners() {
    return this.quest && this.quest.isObjectiveCompleted("swapPimp")
      ? [level.findObject("brothel.petiole")]
      : [level.findObject("brothel.pimp")];
  }

  onLook() {
    game.appendToConsole(
      this.quest && this.quest.script.timeHasPassedSincePimpsPassing
        ? this.quest.tr("inspect-desk-changeling")
        : this.quest.tr("inspect-desk-pimp")
    );
    return true;
  }
}
