import {QuestHelper} from "../helpers.mjs";

const questName = "cristal-den/slavers-errand";
const potiokDefaultSlavePrice = 50;
const slaverDefaultSlavePrice = 100;

export class SlaversErrand extends QuestHelper {
  get potiokSlavePrice() {
    return this.model.getVariable("potiokSlavePrice", potiokDefaultSlavePrice);
  }

  set potiokSlavePrice(value) {
    this.model.setVariable("potiokSlavePrice", value);
  }

  get slaverSlavePrice() {
    return this.model.getVariable("slaverSlavePrice", slaverDefaultSlavePrice);
  }

  set slaverSlavePrice(value) {
    this.model.setVariable("slaverSlavePrice", value);
  }

  get spent() {
    return this.model.getVariable("spent", 0);
  }

  set spent(value) {
    this.model.setVariable("spent", value);
  }

  get talkedMoney() {
    return this.model.hasVariable("talkedMoney");
  }

  set talkedMoney(value) {
    if (value) { this.model.setVariable("talkedMoney", 1); } else { this.model.unsetVariable("talkedMoney"); }
  }

  initialize() {
    this.model.location = "cristal-den";
    this.model.addObjective("fetchSlaves", this.tr("fetchSlaves"));
  }

  getDescription() {
    let text = this.tr("description");
    const negociatedPotiok = this.potiokSlavePrice != potiokDefaultSlavePrice;
    const negociatedSlaver = this.slaverSlavePrice != slaverDefaultSlavePrice;

    if (this.talkedMoney) {
      text += this.tr("desc-negociated-potiok", {potiokSlavePrice: this.potiokSlavePrice});
    }
    if (negociatedSlaver) {
      text += this.tr("desc-negociated-slaver", {slaverSlavePrice: this.slaverSlavePrice});
    }

    if (this.model.isObjectiveCompleted("fetchSlaves")) {
      text += this.tr("desc-slaves-acquired");
    }
    if (this.model.isObjectiveCompleted("reportToBittyPotiok")) {
      if (this.spent > 0) {
        text += this.tr("desc-report-deficit", { amount: this.spent });
      } else if (this.spent < 0) {
        text += this.tr("desc-report-benefit", { amount: -this.spent });
      }
    }

    return text;
  }

  completeObjective(name, completed) {
    if (completed) {
      if (name == "fetchSlaves")
        this.model.addObjective("reportToBittyPotiok", this.tr("reportToBittyPotiok"));
      else if (name == "reportToBittyPotiok")
        this.model.completed = true;
    }
  }

  onSuccess() {
    super.onSuccess();
    game.dataEngine.addReputation("potioks", 25);
  }
}
