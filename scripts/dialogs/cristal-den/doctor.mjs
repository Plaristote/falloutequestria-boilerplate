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
  }
  // END Phony Diagnosis
}

export function create(dialog) {
  return new Dialog(dialog);
}
