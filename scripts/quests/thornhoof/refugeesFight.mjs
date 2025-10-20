import {QuestHelper} from "../helpers.mjs";

export default class extends QuestHelper {
  initialize() {
    this.model.location = "thornhoof";
    this.model.addObjective("ask-silvertide");
    this.model.addObjective("find-refugees");
  }

  get woundedRefugeeKnowledge() {
    return this.model.getVariable("woundedRefugeeKnowledge", 0);
  }

  set woundedRefugeeKnowledge(value) {
    this.model.setVariable("woundedRefugeeKnowledge", value);
  }

  getDescription() {
    let text = this.model.tr("description");

    if (this.woundedRefugeeKnowledge > 0) {
      text += "<p>";
      if (this.woundedRefugeeKnowledge >= 1)
        text += this.model.tr("desc-wounded-refugee");
      if (this.woundedRefugeeKnowledge >= 2)
        text += ' ' + this.model.tr("desc-wounded-refugee-desc");
      text += "</p>";
    }
    return text;
  }
}
