import {QuestHelper, QuestFlags, requireQuest} from "../helpers.mjs";

const itemId = "thornhoof-laboratory-device";

export default class extends QuestHelper {
  initialize() {
    this.model.location = "thornhoof";
    this.model.addObjective("battery", this.tr("fetch-battery"));
    this.model.addObjective("holodisk", this.tr("wipe-data"));
    if (game.player.inventory.getItemOfType(itemId))
      this.model.completeObjective("battery");
  }

  getDescription() {
    let html = "<p>" + this.tr("description") + "</p>";

    if (this.model.hasVariable("toldAboutGhouls"))
      html += "<p>" + this.tr("desc-threats") + "</p>";
    if (this.model.hasVariable("confessedInIntro"))
      html += "<p>" + this.tr("desc-confessed-in-intro") + "</p>";
    if (this.model.hasVariable("foundScrollLogs"))
      html += "<p>" + this.tr("desc-found-scroll-logs") + "</p>";
    if (this.model.isObjectiveCompleted("report")) {
      html += "<p>" + this.tr("desc-report-battery") + "</p>";
      if (this.model.isObjectiveCompleted("holodisk"))
        html += "<p>" + this.tr("desc-report-holodisk-wipe") + "</p>";
      else if (this.model.hasVariable("holodiskRejected"))
        html += "<p>" + this.tr("desc-report-holodisk-reject") + "</p>";
      else
        html += "<p>" + this.tr("desc-report-holodisk-lie") + "</p>";
    }
    return html;
  }

  onItemPicked(item) {
    if (item.itemType == itemId)
      this.model.completeObjective("battery");
  }

  completeObjective(name) {
    switch (name) {
    case "battery":
    case "holodisk":
      if (this.model.areObjectivesCompleted(["battery", "holodisk"]))
        this.model.addObjective("report", this.tr("report"));
      break ;
    case "report":
      this.model.completed = true;
      break ;
    }
  }

  onSuccess() {
    super.onSuccess();
    this.oppositeQuest.failed = true;
    game.dataEngine.addReputation("thornhoof", 25);
  }

  get oppositeQuest() {
    return requireQuest("steel-rangers/hoarfrostQuest", QuestFlags.HiddenQuest);
  }

  get xpReward() {
    let total = 2950;
    if (this.model.isObjectiveFailed("give-battery"))
      total -= 1000;
    if (this.model.hasVariable("confessedInIntro"))
      total += 150;
    if (this.model.hasVariable("foundScrollLogs"))
      total += 250;
    if (this.capsReward > 500)
      total += 150;
    return total;
  }

  get capsReward() {
    return this.model.getVariable("reward", 500);
  }

  set capsReward(value) {
    this.model.setVariable("reward", value);
  }
}
