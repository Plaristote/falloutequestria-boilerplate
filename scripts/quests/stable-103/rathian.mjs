import {QuestHelper} from "../helpers.mjs";

export default class extends QuestHelper {
  initialize() {
    this.model.location = "?";
    this.model.addObjective("overmareBrief", this.tr("overmare-briefing"));
  }

  getDescription() {
    let text = "";

    text += "<p>" + this.tr("desc-called-to-overmare-office") + "</p>";
    if (this.model.isObjectiveCompleted("overmareBrief"))
      text += "<p>" + this.tr("desc-overmare-briefing") + "</p>";
    return text;
  }

  completeObjective(name) {
    switch (name) {
      case "overmareBrief":
        this.model.addObjective("trackCulprit", this.tr("track-culprit"));
        break ;
    }
  }
}
