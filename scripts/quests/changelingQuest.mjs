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
    else
      text += `<p>${this.model.tr("desc-found-others")}</p>`;
    switch (heardAboutUnhausFrom) {
      case "":
        break ;
      case "changeling":
        text += `<p>${this.model.tr("desc-unhaus-from-changeling")}</p>`;
        break ;
      default:
        text += `<p>${this.model.tr("desc-unhaus-from-talking", {unhausRevealerName: heardAboutUnhausFrom})}</p>`;
        break ;
    }
    if (this.model.isObjectiveCompleted("findLair")) {
      if (this.model.hasVariable("kidnapped"))
        text += `<p>${this.model.tr("desc-kidnapped")}</p>`;
      else
        text += `<p>${this.model.tr("desc-found-secret-entrance")}</p>`;
    }
    if (this.model.hasVariable("queenProposal"))
      text += `<p>${this.model.tr("desc-queen-proposal")}</p>`;
    return text;
  }

  onToldAboutUnhaus(npc) {
    let revealer = "changeling";
    if (npc.statistics.race != "changeling")
      revealer = npc.statistics.name;
    this.model.setVariable("heardAboutUnhaus", revealer);
    this.model.completeObjective("findAboutUnhaus");
    this.model.location = "unhaus";
  }

  completeObjective(name) {
    switch (name) {
    case "findLair":
      this.model.location = "unhaus";
      break ;
    }
  }
}
