import {QuestHelper} from "../helpers.mjs";

const questName = "cristal-den/slavers-errand";
export const potiokDefaultSlavePrice = 50;
export const slaverDefaultSlavePrice = 100;
export const errandSlaveCount = 10;
// Share of the slavers' price knocked off when the player escorts the convoy to Hillburrow.
export const escortDiscountRate = 0.4;
// With this many slaves or fewer reaching Hillburrow, Bitty is furious rather than merely angry.
export const heavyLossThreshold = 3;

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

  // BEGIN Escort (the player walks the slaves to Hillburrow in exchange for a discount)
  get escortStarted() {
    return this.model.hasVariable("escortStarted");
  }

  get escortFailure() {
    return this.model.getVariable("escortFailure", "");
  }

  get slavesLost() {
    return this.model.getVariable("slavesLost", 0);
  }

  set slavesLost(value) {
    this.model.setVariable("slavesLost", value);
  }

  get slavesAlive() {
    return errandSlaveCount - this.slavesLost;
  }

  // Slaves Bitty actually receives: everyone, unless the convoy lost some on the way.
  get slavesDelivered() {
    return this.model.getVariable("slavesDelivered", errandSlaveCount);
  }

  // "none" | "some" | "heavy" - how upset Bitty must be about the slaves lost.
  get lossTier() {
    const delivered = this.slavesDelivered;

    if (delivered >= errandSlaveCount)
      return "none";
    return delivered <= heavyLossThreshold ? "heavy" : "some";
  }

  startEscort(pricePaid) {
    this.model.setVariable("escortStarted", 1);
    this.model.setVariable("escortPrice", pricePaid);
    this.slavesLost = 0;
    this.refreshEscortObjective();
  }

  refreshEscortObjective() {
    // addObjective overwrites the label of an existing objective.
    this.model.addObjective("escortConvoy", this.tr("escortConvoy", {alive: this.slavesAlive, total: errandSlaveCount}));
  }

  onCharacterKilled(character) {
    if (this.escortStarted && !this.model.isObjectiveCrossedOff("escortConvoy")
        && character.scriptName == "cristal-den/slavers/convoy-slave.mjs") {
      this.slavesLost++;
      this.refreshEscortObjective();
    }
  }

  onConvoyArrived(survivors) {
    this.slavesLost = errandSlaveCount - survivors;
    this.model.setVariable("slavesDelivered", survivors);
    this.model.completeObjective("escortConvoy");
    this.model.completeObjective("fetchSlaves");
  }

  // reason: "wiped" (every slave died) or "deserted" (the player left the convoy to its fate)
  onConvoyFailed(reason) {
    this.model.setVariable("escortFailure", reason);
    this.model.setVariable("slavesDelivered", 0);
    this.model.failObjective("escortConvoy");
    this.model.failed = true;
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

    if (this.escortStarted) {
      text += this.tr("desc-escort-started", {price: this.model.getVariable("escortPrice", 0)});
      if (this.escortFailure == "wiped")
        text += this.tr("desc-escort-wiped");
      else if (this.escortFailure == "deserted")
        text += this.tr("desc-escort-deserted");
      else if (this.model.isObjectiveCompleted("fetchSlaves")) {
        text += this.tr("desc-escort-arrived", {delivered: this.slavesDelivered, total: errandSlaveCount});
        if (this.lossTier == "heavy")
          text += this.tr("desc-escort-heavy-losses");
      }
    } else if (this.model.isObjectiveCompleted("fetchSlaves")) {
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
    switch (this.lossTier) {
      case "none":  game.dataEngine.addReputation("potioks", 25); break ;
      case "heavy": game.dataEngine.addReputation("potioks", -25); break ;
    }
  }

  onFailed() {
    super.onFailed();
    // Wiped out convoy or deserted: Bitty will have the player executed on sight (see her dialog).
    if (this.escortStarted)
      game.dataEngine.addReputation("potioks", -50);
  }
}
