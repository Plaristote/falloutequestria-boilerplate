import {QuestHelper} from "../helpers.mjs";

const itemId = "thornhoof-laboratory-device";

export default class extends QuestHelper {
  initialize() {
    this.model.location = "thornhoof";
    this.model.addObjective("battery", i18n.t("quests.thornhoof/scrollQuest.fetch-battery"));
    if (game.player.inventory.getItemOfType(itemId))
      this.model.completeObjective("battery");
  }

  getDescription() {
    let html = "<p>" + this.tr("description") + "</p>";

    if (this.model.isObjectiveCompleted("report"))
      html += "<p>" + this.tr("desc-report") + "</p>";
    if (this.model.isObjectiveCompleted("delivery"))
      html += "<p>" + this.tr("desc-delivery") + "</p>";
    return html;
  }

  onItemPicked(item) {
    if (item.itemType == itemId)
      this.model.completeObjective("battery");
  }

  completeObjective(name) {
    switch (name) {
    case "battery":
      this.model.addObjective("report", this.tr("report"));
      break ;
    case "report":
      this.model.location = "steel-rangers";
      this.model.addObjective("delivery");
      break ;
    case "delivery":
      this.model.completed = true;
      if (game.quests.getQuest("thorn"))
      break ;
    }
  }

  onSuccess() {
    super.onSuccess();
    this.oppositeQuest.failObjective("give-battery");
    game.dataEngine.addReputation("steel-rangers", 35);
  }

  onFailure() {
    super.onFailure();
    game.dataEngine.addReputation("steel-rangers", -25);
  }

  get xpReward() {
    return 1000;
  }

  get capsReward() {
    return 1000;
  }

  get oppositeQuest() {
    return requireQuest("thornhoof/scrollQuest", QuestFlags.HiddenQuest);
  }
}
