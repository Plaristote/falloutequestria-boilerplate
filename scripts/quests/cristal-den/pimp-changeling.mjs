import {QuestHelper, QuestFlags, requireQuest} from "../helpers.mjs";

export default class PimpChangeling extends QuestHelper {
  get xpReward() {
    let total = 1325;
    if (this.model.isObjectiveCompleted("distractGuards"))
      total += 250;
    if (this.model.hasVariable("isWithPetiole"))
      total += 75;
    return total;
  }

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

    if (this.model.hasObjective("reportToQueen") && !this.startedByChangelingQueen)
      text += "<p>" + this.model.tr("desc-report-to-mysterious-queen") + "</p>";
    else if (this.model.isObjectiveCompleted("killPimp") && this.startedByChangelingQueen)
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

  get petiole() {
    return typeof level != "undefined" ? level.findObject("brothel.petiole") : null;
  }

  get isWithPetiole() {
    return this.model.getVariable("isWithPetiole", 0) == 1;
  }

  set isWithPetiole(value) {
    this.model.setVariable("isWithPetiole", value ? 1 : 0);
    if (this.petiole) {
      if (value)
        this.petiole.tasks.addUniqueTask("followingPlayerToKillPimp", 500, 1);
      else
        this.petiole.tasks.removeTask("followingPlayerToKillPimp");
    }
  }

  get timeHasPassedSincePimpsPassing() {
    const timestamp = this.model.getVariable("killedPimpAt", 0);

    return timestamp && game.timeManager.getTimestamp() - timestamp > 60*60*24;
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
    if (!this.model.hasObjective("killPimp"))
      this.model.addObjective("killPimp", this.model.tr("kill-pimp"));
    this.model.completeObjective("killPimp");
    if (this.startedByChangelingQueen)
      this.model.addObjective("reportToQueen", this.model.tr("report-to-queen"));
  }

  onTalkedToPetioleAfterQuest() {
    if (!this.startedByChangelingQueen)
      this.model.addObjective("reportToQueen", this.model.tr("report-to-queen"));
  }

  startDistractionPlan() {
    this.model.addObjective("distractGuards", this.model.tr("distract-guards"));
  }

  completeObjective(name) {
    switch (name) {
      case "distractGuards":
        this.petiole.script.assassinatePimp();
        break ;
      case "killPimp":
        this.model.setVariable("killedPimpAt", game.timeManager.getTimestamp());
        break ;
      case "swapPimp":
        this.model.completed = true;
        break ;
    }
  }
}
