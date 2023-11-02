import {QuestHelper} from "./helpers.mjs";

class GemstoneQuest extends QuestHelper {
  initialize() {
    this.model.location = "tutorial";
    this.model.addObjective("gemstones", "objective-mine");
    this.model.addObjective("give-gemstones", "objective-give");
  }

  onCharacterKilled(victim, killer) {
    if (victim == level.getObjectByName("trialDog"))
      this.model.failed = true;
  }

  onItemPicked(item) {
    if (item.itemType === "gemstone")
      this.model.completeObjective("gemstones");
  }

  onCompleted() {
    const xp = 750;

    game.appendToConsole(i18n.t("messages.quest-complete", {
      title: this.tr("title"),
      xp:    xp
    }));
    game.player.statistics.addExperience(xp);
    game.dataEngine.addReputation("diamond-dogs", 50);
  }
}

export function create(model) {
  return new GemstoneQuest(model);
}
