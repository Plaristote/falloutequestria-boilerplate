import {QuestHelper} from "../helpers.mjs";

export default class extends QuestHelper {
  initialize() {
    this.model.location = "thornhoof";
    this.model.addObjective("ask-silvertide");
    this.model.addObjective("find-refugees");
  }

  get woundedRefugeeKnowledge() {
    return this.model.getVariable("woundedRefugeeKnowledge", 0);
  }

  set woundedRefugeeKnowledge(value) {
    this.model.setVariable("woundedRefugeeKnowledge", value);
    if (value >= 1)
      this.model.addObjective("find-wounded-refugee");
  }

  get woundedDetected() {
    return this.model.getVariable("woundedDetected", 0);
  }

  set woundedDetected(value) {
    this.model.setVariable("woundedDetected", value);
    if (value >= 1)
      this.model.addObjective("ask-shaman-about-wounded");
    if (value >= 2)
      this.model.completeObjective("find-wounded-refugee");
  }

  get learnAboutHideout() {
    return this.model.getVariable("hideoutKnowledge", false);
  }

  set learnAboutHideout(value) {
    if (!this.model.hasVariable("hideoutKnowledge"))
      this.model.setVariable("hideoutKnowledge", value);
  }

  get hideoutWeaponsRemoved() {
    return this.model.getVariable("weaponsRemoved", 0) == 1;
  }

  set hideoutWeaponsRemoved(value) {
    this.model.setVariable("weaponsRemoved", value ? 1 : 0);
  }

  onHideoutGrabbed() {
    this.model.completeObjective("find-refugees");
    this.model.setVariable("refugeesArrested", 1);
  }

  onHideoutCleared() {
    this.model.completeObjective("find-refugees");
    this.model.setVariable("refugeesArrested", 1);
    this.model.setVariable("refugeesKilledByMilita", 1);
    this.model.completed = true;
  }

  onConfrontLeafWithRefugees() {

  }

  onReportDeadRefugees() {
    game.dataEngine.addReputation("thornhoof-refugees", -20);
    game.dataEngine.addReputation("thornhoof", 15);
    this.model.completed = true;
  }

  onTrialEnded(solution) {
    this.model.setVariable("trialOutcome", solution);
    switch (solution) {
      case "mercy":
        game.dataEngine.addReputation("thornhoof-refugees", 100);
        game.dataEngine.addReputation("thornhoof", -15);
        break ;
      case "labor":
        game.dataEngine.addReputation("thornhoof-refugees", 15);
        game.dataEngine.addReputation("thornhoof", 15);
        level.script.hiddenRefugees.disappearCharacters();
        break ;
      case "death":
        game.dataEngine.addReputation("thornhoof-refugees", -100);
        game.dataEngine.addReputation("thornhoof", 15);
        level.script.hiddenRefugees.disappearCharacters();
        break ;
    }
    this.model.completed = true;
  }

  getDescription() {
    let text = this.model.tr("description");
    const trialOutcome = this.model.getVariable("trialOutcome", 0);

    if (this.woundedRefugeeKnowledge > 0) {
      text += "<p>";
      if (this.woundedRefugeeKnowledge >= 1)
        text += this.model.tr("desc-wounded-refugee");
      if (this.woundedRefugeeKnowledge >= 2)
        text += ' ' + this.model.tr("desc-wounded-refugee-desc");
      text += "</p>";
    }

    if (this.woundedDetected > 0) {
      text += "<p>" + this.model.tr("desc-wounded-detected-1");
      if (this.woundedDetected > 1)
        text += ' ' + this.model.tr("desc-wounded-detected-2");
      text += "</p>";
    }

    if (this.model.hasVariable("refugeesKilledByMilita")) {
      text += "<p>" + this.model.tr("desc-milita-intro") + ' ' + this.model.tr("desc-milita-raid") + "</p>";
    } else if (this.model.hasVariable("refugeesArrested")) {
      text += "<p>" + this.model.tr("desc-milita-intro") + ' ' + this.model.tr("desc-milita-arrest") + "</p>";
    } else if (this.model.hasVariable("refugeesBrought")) {
      text += "<p>" + this.model.tr("desc-refugees-brought") + "</p>";
    } else if (this.model.hasVariable("refugeesKilled")) {
      text += "<p>" + this.model.tr("desc-refugees-killed") + "</p>";
    }

    switch (trialOutcome) {
    case "mercy":
    case "labor":
    case "death":
      text += "<p>" + this.model.tr("desc-trial-intro");
      text += this.model.tr(`desc-trial-${trialOutcome}`) + "</p>";
      break ;
    }

    return text;
  }
}
