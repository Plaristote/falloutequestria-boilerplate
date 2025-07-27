import {QuestHelper, QuestFlags, requireQuest} from "../helpers.mjs";

export default class PimpChangeling extends QuestHelper {
  initialize() {
    this.model.location = "cristal-den";
    this.model.addObjective("talkToPetiole", this.tr("talk-to-petiole"));
  }

  getDescription() {
    let text = "";

    text += "<p>";
    if (this.startedByChangelingQueen)
      text += this.model.tr("intro-on-queens-orders");
    else
      text += this.model.tr("intro-lied-to-petiole");
    text += "</p>";

    if (this.petioleKilled) {
      text += "<p>" + this.model.tr("desc-petiole-killed");
      if (this.startedByChangelingQueen)
          text += this.model.tr("desc-petiole-killed-on-queens-orders");
      text += "</p>";
    }

    if (this.model.isObjectiveCompleted("killPimp"))
      text += "<p>" + this.model.tr("desc-pimp-killed") + "</p>";
    return text;
  }

  get startedByChangelingQueen() {
    return this.model.getVariable("onQueensOrders", 0) == 1;
  }

  set startedByChangelingQueen(value) {
    this.model.setVariable("onQueensOrders", value ? 1 : 0);
  }

  get petioleKilled() {
    return this.model.getVariable("petioleKilled", 0) == 1;
  }

  set petioleKilled(value) {
    this.model.setVariable("petioleKilled", value ? 1 : 0);
  }

  onTalkedToPetiole() {
    this.model.addObjective("killPimp", this.model.tr("kill-pimp"));
  }

  onCharacterKilled(character) {
    switch (character.characterSheet) {
      case "cristal-den/brothel/petiole":
        return this.onPetioleKilled();
      case "cristal-den/brothel/pimp":
        return this.onPimpKilled();
    }
  }

  onPetioleKilled() {
    this.petioleKilled = this.model.failed = true;
  }

  onPimpKilled() {
    this.model.completeObjective("killPimp");
  }
}
