import {OwnedStorage} from "../ownedStorage.mjs";

export default class extends OwnedStorage {
  get storageOwners() {
    return [game.getCharacter("rathian")];
  }

  onTakeItem(user, item, quantity) {
    const result = super.onTakeItem(user, item, quantity);

    if (result && item.itemType == "quest-rathian-computer-parts") {
      const quest = game.quests.addQuest("junkville/getRathianParts", 2);
      if (quest)
        quest.completeObjective("fetchParts");
    }
    return result;
  }
}
