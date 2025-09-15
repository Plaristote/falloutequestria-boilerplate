import {QuestHelper} from "../helpers.mjs";
import {DealWithRathian} from "../../characters/rathian/captive.mjs";

export default class extends QuestHelper {
  initialize() {
    this.model.location = "?";
    this.model.addObjective("overmareBrief", this.tr("overmare-briefing"));
  }

  getDescription() {
    let text = "";

    text += "<p>" + this.tr("desc-called-to-overmare-office") + "</p>";
    if (this.model.isObjectiveCompleted("overmareBrief")) {
      text += "<p>" + this.tr("desc-overmare-briefing") + "</p>";
      text += "<p>" + this.tr("desc-signal-intro") + "</p>";
    }
    if (this.model.hasVariable("reachedCapital"))
      text += "<p>" + this.tr("desc-signal-followup") + "</p>";
    if (this.model.hasVariable("foundSignal"))
      text += "<p>" + this.tr("desc-found-signal") + "</p>";
    if (this.model.isObjectiveCompleted("trackCulprit"))
      text += "<p>" + this.tr("desc-found-rathian") + "</p>";
    if (this.model.hasVariable("knowsAboutSentinel"))
      text += "<p>" + this.tr("desc-learned-about-sentinel") + "</p>";
    if (this.model.hasVariable("knowsAboutLaboratory"))
      text += "<p>" + this.tr("desc-learned-about-lab") + "</p>";
    if (this.model.isObjectiveCompleted("dealWithRathian")) {
      switch (this.model.getVariable("rathianMurdered", 2)) {
        case 0:
          text += "<p>" + this.tr("desc-rathian-died") + "</p>";
          break ;
        case 1:
          text += "<p>" + this.tr("desc-rathian-murdered") + "</p>";
          break ;
        case 2:
          text += this.getDescriptionForRathianEscape();
          break ;
      }
    }
    return text;
  }

  getDescriptionForRathianEscape() {
    const rathian = game.getCharacter("rathian");
    const flag = rathian.getVariable("dealWithRathian");
    let text = "";

    if ((flag & DealWithRathian.GaveUpSentinel) > 0)
      text += "<p>" + this.tr("desc-rathian-gaveup-sentinel") + "</p>";
    if ((flag & DealWithRathian.LeftWithPlayer) > 0)
      text += "<p>" + this.tr("desc-rathian-escaped-with-player") + "</p>";
      else if ((flag & DealWithRathian.LeaveBehind) > 0 && !game.playerParty.containsCharacter(rathian)) {
      if ((flag & DealWithRathian.CellOpened) > 0)
        text += "<p>" + this.tr("desc-rathian-left-behind") + "</p>";
      else
        text += "<p>" + this.tr("desc-rathian-left-with-herd") + "</p>";
    }
    return text;
  }

  completeObjective(name) {
    switch (name) {
      case "overmareBrief":
        this.model.addObjective("trackCulprit", this.tr("track-culprit"));
        game.script.rathianTrack = 1;
        break ;
      case "trackCulprit":
        this.model.addObjective("dealWithRathian", this.tr("deal-with-rathian"));
        break ;
      case "dealWithRathian":
        this.onDealtWithRathian();
        break ;
    }
  }

  updateRathianTrack() {
    const currentCase = game.worldmap.currentCase;

    if (currentCase.x >= 16 && currentCase.x <= 18
     && currentCase.y >= 8  && currentCase.y <= 9) {
      this.model.setVariable("reachedCapital", 1);
      game.appendToConsole(this.tr("signal-update"));
    } else if (currentCase.x >= 13 && currentCase.x <= 30
            && currentCase.y >= 14 && currentCase.y <= 22) {
      if (!this.model.hasVariable("foundSignal")) {
        this.model.setVariable("foundSignal", 1);
        game.worldmap.revealCase(16, 19);
        game.appendToConsole(this.tr("signal-update"));
      }
    }
  }

  onCharacterKilled(character, killer) {
    if (character == game.getCharacter("rathian")) {
      this.model.completeObjective("dealWithRathian");
      this.model.setVariable("rathianMurdered", game.playerParty.containsCharacter(killer) ? 1 : 0);
    }
  }

  onDealtWithRathian() {
    if (this.model.hasVariable("knowsAboutSentinel"))
      this.model.addObjective("dealWithSentinel", this.tr("deal-with-sentinel"));
    this.model.addObjective("reportOvermare", this.tr("report-to-overmare"));
  }
}
