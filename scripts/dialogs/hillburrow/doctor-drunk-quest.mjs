import {completeDrunkenQuest} from "../../quests/hillburrow/saveDrunkenMaster.mjs";

class Dialog {
  constructor(dialog) {
    this.dialog = dialog;
  }

  get variables() {
    return this.dialog.npc;
  }

  entryLine() {
    if (!this.variables.hasVariable("met")) {
      this.variables.setVariable("met", 1);
      return this.dialog.t("entry");
    }
    return this.dialog.t("entry-alt");
  }

  hasDoctorBag() {
    return game.player.inventory.count("doctor-bag") > 0;
  }

  handDoctorBag() {
    game.player.inventory.removeItemOfType("doctor-bag");
    game.asyncAdvanceTime(15, completeDrunkenQuest);
  }

  medicalCheckFails() {
    return !this.medicalCheckSuccess();
  }

  medicalCheckSuccess() {
    return game.player.statistics.medicine >= 85;
  }

  onDiagnostic() {
    if (!this.variables.hasVariable("diagnostic")) {
      this.variables.setVariable("diagnostic", 1);
      game.appendToConsole(this.dialog.t("received-diagnostic-reward"));
      game.player.statis.addExperience(175);
    }
  }

  canPerformHeal() {
    return game.player.statistics.race === "unicorn" && game.player.statistics.spellcasting >= 75;
  }

  tryToHeal() {
    game.asyncAdvanceTime(15, completeDrunkenQuest);
    return "heal-success";
  }

  negociatingAttempt() {
    game.dataEngine.addReputation("hillburrow", -15);
    if (game.player.statistics.barter >= 61) {
      game.player.inventory.addItemOfType("bottlecaps", 50);
      return { textKey: "negociate-doctor-bag-success" };
    }
    return { textKey: "negociate-doctor-bag-failure" };
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
