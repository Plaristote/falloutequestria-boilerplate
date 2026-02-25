import {CharacterBehaviour} from "./../../character.mjs";

export default class extends CharacterBehaviour {
  constructor(model) {
    super(model);
  }

  get dialog() {
    if (this.model.hasVariable("notTalking"))
      return null;
    return "capital/theater/founder";
  }

  get textBubbles() {
    if (this.model.hasVariable("notTalking"))
      return [{ content: i18n.t("dialogs.capital/theater/founder.brooding-bubble"), duration: 3000, color: "darkblue" }];
    return null;
  }

  startBrooding() {
    this.model.setVariable("notTalking", 1);
    this.model.addUniqueTask("endBroodingTask", 60*60*2*1000, 1);
  }

  endBroodingTask() {
    this.model.unsetVariable("notTalking");
  }
}
