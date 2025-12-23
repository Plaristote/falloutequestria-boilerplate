import {QuestHelper} from "../helpers.mjs";

export default class extends QuestHelper {
  initialize() {
    this.model.location = "thornhoof";
    this.model.addObjective("battery", this.tr("fetch-battery"));
    this.model.addObjective("holodisk", this.tr("wipe-data"));
  }

  getDescription() {
    let html = "<p>" + this.tr("description") + "</p>";

    if (this.model.hasVariable("toldAboutGhouls"))
      html += "<p>" + this.tr("desc-threats") + "</p>";
    if (this.model.hasVariable("confessedInIntro"))
      html += "<p>" + this.tr("desc-confessed-in-intro") + "</p>";
    return html;
  }

  completeObjective(name) {
    switch (name) {
    case "battery":
    case "holodisk":
      if (this.model.isObjectiveCompleted("battery") && this.model.isObjectiveCompleted("holodisk"))
        this.model.addObjective("report", this.tr("report"));
      break ;
    case "report":
      this.model.completed = true;
      break ;
    }
  }
}
