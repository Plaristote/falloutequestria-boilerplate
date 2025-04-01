import {skillCheck} from "../../../cmap/helpers/checks.mjs";

class Dialog {
  constructor(dialog) {
    this.dialog = dialog;
  }

  runDiagnostic() {
    level.setVariable("diagnosticRan", 1);
  }

  knowsAboutOfflineGenerator() {
    return level.getVariable("diagnosticRan") == 1;
  }

  facilitateGeneratorRepair() {
    level.setVariable("generatorManualRead", 1);
  }

  canTriggerAdvancedDiagnostic() {
    return game.playerParty.highestStatistic("science") > 70;
  }

  canRedirectEnergyToElevators() {
    return game.playerParty.highestStatistic("science") > 85;
  }

  redirectEnergyToElevator() {
    level.setVariable("powerRedirected", 1);
  }

  tryFindAnomalyInCorruptFiles() {
    return skillCheck(game.player, "perception", { dice: 4, target: 8 });
  }

  scanCorruptFiles() {
    return `restricted-alim/${this.tryFindAnomalyInCorruptFiles() ? "corrupt-files-success" : "corrupt-files"}`;
  }

  makeBloodPact() {
    game.player.takeDamage(Math.min(game.player.statistics.hitPoints - 1, 5), null);
    level.addTextBubble(game.player, i18n.t("capital.laboratory.player-on-blood-pact"), 3500, "lightgray");
    level.script.onBloodPact();
  }

  scientistLogsFixed() {
    return game.level?.hasVariable("fixedScientistLogs");
  }

  scientistLogsNotFixed() {
    return !this.scientistLogsFixed();
  }

  canFixScientistLogs() {
    return this.scientistLogsNotFixed() && game.player?.statistics?.science >= 75;
  }

  scientistLogs() {
    if (this.scientistLogsNotFixed())
      return { textKey: "scientist-room/logs" };
    else if (this.dialog.previousAnswer == "scientist-fix-corrupt-files")
      return { textKey: "scientist-room/logs-fix-success" };
    return { textKey: "scientist-room/logs-fixed" };
  }

  fixScientistCorruptFiles() {
    if (skillCheck(game.player, "science", { dice: 20, target: 95 })) {
      game.player.statistics.addExperience(50);
      level.setVariable("fixedScientistLogs", 1);
    }
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
