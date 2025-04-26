import {QuestHelper} from "../helpers.mjs";

export default class extends QuestHelper {
  initialize() {
    this.model.location = "thornhoof";
    this.model.addObjective("lead-caravan", this.tr("lead-caravan"));
    this.model.addObjective("convince-narbi-fargo", this.tr("convince-narbi-fargo"));
    this.model.addObjective("steel-rangers-shipment", this.tr("steel-rangers-shipment"));
  }

  getDescription() {
    let text = this.model.tr("description-intro") + "<br><br>";
    if (this.model.isObjectiveCompleted("convince-narbi-fargo")) {
      if (this.playerPaidInAdvance)
        text += this.model.tr("description-narbi-payed");
      else
        text += this.model.tr("description-narbi-convinced");
      text += "<br><br>";
    }
    if (this.model.isObjectiveCompleted("convince-laurie")) {
      text += this.model.tr("description-laurie-convinced");
      text += "<br><br>";
    }
    if (this.model.isObjectiveCompleted("steel-rangers-shipment") || this.model.isObjectiveCompleted("lead-caravan")) {
      text += this.model.tr("description-steel-ranger-base") + ' ';
      if (this.model.isObjectiveCompleted("steel-rangers-shipment"))
        text += this.model.tr("description-steel-ranger-success");
      else
        text += this.model.tr("description-steel-ranger-failure");
      text += "<br><br>";
    }
    if (this.model.isObjectiveCompleted("lead-caravan")) {
      text += this.model.tr("description-lead-caravan") + ' ';
      if (this.model.isObjectiveCompleted("steel-rangers-shipment")) {
        text += this.model.tr("description-end-success");
      } else {
        text += this.model.tr("description-end-no-ammo");
        if (this.model.failed)
          text += this.model.tr("description-end-failure");
        else {
          text += this.model.tr("description-end-justify");
          text += this.model.tr("description-end-success");
        }
      }
    }
    return text;
  }

  onCaravanFailure() {
    if (this.caravanInProgress) {
      this.model.unsetVariable("started");
      this.model.failed = true;
    }
  }

  get caravanStarted() {
    return this.model.getVariable("started", 0) == 1;
  }

  get caravanInProgress() {
    return this.caravanStarted && !this.model.isObjectiveCompleted("lead-caravan");
  }

  get playerPaidInAdvance() {
    return this.model.hasVariable("paidInAdvance");
  }

  get playerAdvanceAmount() {
    return this.model.getVariable("paidInAdvance", 0);
  }

  set playerAdvanceAmount(value) {
    return this.model.setVariable("paidInAdvance", value);
  }

  get playerReceivedReward() {
    return this.model.hasVariable("receivedReward");
  }

  set playerReceivedReward(value) {
    value ? this.model.setVariable("receivedReward", 1) : this.model.unsetVariable("receivedReward");
  }

  completeObjective(name) {
    switch (name) {
    case "convince-narbi-fargo":
    case "convince-laurie":
      this.model.addObjective("convince-laurie", this.tr("convince-laurie"));
      break ;
    case "lead-caravan":
      this.model.addObjective("report", this.tr("report-to-silvertide"));
      game.dataEngine.addReputation("thornhoof", 75);
      if (this.model.isObjectiveCompleted("steel-rangers-shipment"))
        game.dataEngine.addReputation("thornhoof", 100);
      break ;
    }
  }
}
