import HealerComponent from "../healer.mjs";

class Dialog {
  constructor(dialog) {
    this.dialog = dialog;
    this.healer = new HealerComponent(this);
    this.healer.makeCashPromptText = function(target, cost) {
      if (target === game.playerParty)
        return dialog.t("cash-prompt-party", { cost: cost });
      return dialog.t("cash-prompt", { cost: cost })
    }
  }

  entry() {
    if (this.phonyDiagnosisNotStarted())
      return { textKey: "entry" };
    else if (this.dialog.npc.getVariable("phonyDiagnosticResist", 0) > 1)
      return { textKey: "entry-unliked" };
    return { textKey: "entry-liked" };
  }

  healPrompt() {
    return this.healer.healPrompt();
  }

  // Phony Diagnosis
  onAboutToExit() {
    if (this.phonyDiagnosisNotStarted())
      return "phony-diagnosis/prevent-exit";
  }

  phonyDiagnosisNotStarted() {
    return !this.dialog.npc.hasVariable("phonyDiagnostic");
  }

  phonyDiagnosisStart() {
    this.dialog.npc.setVariable("phonyDiagnostic", 1)
  }

  phonyDiagnosisCharismaCheck() {
    return game.player.statistics.charisma >= 7;
  }

  phonyDiagnosisIntelligenceCheck() {
    const threshold = 8
      + 1 * this.dialog.npc.getVariable("phonyDiagnosticResist", 0);
    return game.player.statistics.intelligence >= threshold;
  }

  phonyDiagnosisMedicalCheck() {
    const threshold = 55
      + 10 * this.dialog.npc.getVariable("phonyDiagnosticResist", 0);
    return game.player.statistics.medicine >= threshold;
  }

  phonyDiagnosisMedicalCheckLast() {
    return this.phonyDiagnosisMedicalCheck() && this.dialog.npc.getVariable("phonyDiagnosticResist", 0) > 0;
  }

  phonyDiagnosisIntelligenceCheckLast() {
    return this.phonyDiagnosisIntelligenceCheck() && this.dialog.npc.getVariable("phonyDiagnosticResist", 0) > 0;
  }

  phonyDiagnosisResisted() {
    const value = this.dialog.npc.getVariable("phonyDiagnosticResist", 0);
    this.dialog.npc.setVariable("phonyDiagnosticResist", value + 1);
    if (value == 1)
      return "phony-diagnosis/resisted";
  }

  phonyDiagnosisCaved() {
    game.player.statistics.togglePerk("armorBidAilments", true);
    this.dialog.npc.setVariable("phonyDiagnostic", 2);
    this.dialog.npc.setVariable("lastAilmentsTreatmentBoughtAt", game.timeManager.getTimestamp());
  }

  phonyDiagnosisPickable() {
    const lastBought = this.dialog.npc.getVariable("lastAilmentsTreatmentBoughtAt");
    return game.player.statistics.perks.indexOf("armorBidAilments") >= 0
        && game.timeManager.getTimestamp() - lastBought >= 24 * 60 * 60;
  }

  phonyDiagnosisTreatmentBought() {
    this.dialog.npc.setVariable("lastAilmentsTreatmentBoughtAt", game.timeManager.getTimestamp());
    this.dialog.npc.inventory.addItemOfType("bottlecaps", this.phonyDiagnosisTreatmentCost);
    game.player.inventory.removeItemOfType("bottlecaps", this.phonyDiagnosisTreatmentCost);
    game.player.inventory.addItemOfType("armor-bid-ailments-treatment");
  }

  get phonyDiagnosisTreatmentCost() {
    return 30;
  }

  get canPayPhonyDiagnosisTreatment() {
    return game.player.inventory.count("bottlecaps") >= this.phonyDiagnosisTreatmentCost;
  }
  // END Phony Diagnosis
}

export function create(dialog) {
  return new Dialog(dialog);
}
