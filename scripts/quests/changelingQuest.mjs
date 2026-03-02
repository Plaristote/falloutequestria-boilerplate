import {QuestHelper} from "./helpers.mjs";

export default class extends QuestHelper {
  initialize() {
    this.model.location = "unknown";
  }

  getDescription() {
    let text = `<p>${this.model.tr("description")}</p>`;
    const heardAboutUnhausFrom = this.model.getVariable("heardAboutUnhaus", "");

    if (this.model.hasVariable("foundCorpse"))
      text += `<p>${this.model.tr("desc-found-corpse")}</p>`;
    else if (this.model.hasVariable("foundOvipostorNote"))
      text += `<p>${this.model.tr("desc-found-ovipostor-note")}</p>`;
    else
      text += `<p>${this.model.tr("desc-found-others")}</p>`;
    if (!this.model.hasVariable("foundOvipostorNote")) {
      switch (heardAboutUnhausFrom) {
        case "":
          break ;
        case "changeling":
          text += `<p>${this.model.tr("desc-unhaus-from-changeling")}</p>`;
          break ;
        case "ovipostor-note":
          text += `<p>${this.model.tr("desc-found-ovipostor-note")}</p>`;
          break ;
        default:
          text += `<p>${this.model.tr("desc-unhaus-from-talking", {unhausRevealerName: heardAboutUnhausFrom})}</p>`;
          break ;
      }
    }
    if (this.model.isObjectiveCompleted("findLair")) {
      if (this.model.hasVariable("kidnapped"))
        text += `<p>${this.model.tr("desc-kidnapped")}</p>`;
      else
        text += `<p>${this.model.tr("desc-found-secret-entrance")}</p>`;
    }
    if (this.model.hasVariable("queenProposal"))
      text += `<p>${this.model.tr("desc-queen-proposal")}</p>`;
    if (this.model.hasVariable("queenKilled"))
      text += `<p>${this.model.tr("desc-queen-killed")}</p>`;
    return text;
  }

  canKidnapPlayer() {
    return !this.model.hasVariable("kidnapped") && !this.model.hasVariable("queenProposal") && !this.model.completed;
  }

  kidnapPlayer() {
    this.model.setVariable("kidnapped", 1);
    game.asyncAdvanceTime(15, function() {
      game.switchToLevel("unhaus-hive", "jail-cell-3", function() {
        level.script.initializeKidnappedPlayer();
      });
    });
  }

  onToldAboutUnhaus(npc) {
    let revealer = "changeling";
    if (npc.statistics.race != "changeling")
      revealer = npc.statistics.name;
    this.model.setVariable("heardAboutUnhaus", revealer);
    this.model.completeObjective("findAboutUnhaus");
    this.model.location = "unhaus";
  }

  onQueenKilled() {
    this.model.setVariable("queenKilled", 1);
    this.model.completed = true;
  }

  completeObjective(name) {
    switch (name) {
    case "findLair":
      this.model.location = "unhaus";
      break ;
    }
  }
}
