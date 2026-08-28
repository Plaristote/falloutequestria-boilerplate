import {QuestHelper} from "../helpers.mjs";

const questName = "hillburrow/sabotage";

export function canWarnPotioksAboutBibin() {
  const quest = game.quests.getQuest(questName);
  return quest && quest.script.canWarnPotioksAboutBibin;
}

export function wasSaboteurInterrogatedByBibin() {
  const quest = game.quests.getQuest(questName);
  return quest && quest.getVariable("bittyInterrogatedHobo", 0) == 1;
}

export function saboteurShouldDisappear() {
  const quest = game.quests.getQuest(questName);
  return quest && quest.script.foughtWaterCarrier;
}

export function sabotageReportedToMatriarch() {
  game.quests.getQuest(questName).completeObjective("mustWarnPotioksAboutBibin");
  quest.script.pushUniqueEvent("warnedPotioksAboutBibin");
}

export function canReportSabotageToMatriarch() {
  const quest = game.quests.getQuest(questName);
  return quest && quest.completed && !quest.isObjectiveCompleted("mustWarnPotioksAboutBibin");
}

export function bibinSabotageReportedToMatriarch() {
  sabotageReportedToMatriarch();
  game.quests.getQuest(questName).setVariable("matriarchKnwosAboutBibinInvolvement", 1);
}

export class Sabotage extends QuestHelper {
  initialize() {
    this.model.location = "hillburrow";
    this.model.addObjective("findCulprit", this.tr("findCulprit"));
  }

  getDescription() {
    let text = "";

    if (this.sentByMatriarch)
      text += this.tr("desc-sentByMatriarch");
    if (this.model.hasVariable("receivedFromBitty"));
      text += this.tr("description");
    this.events.forEach(event => {
      text += this.tr(`desc-${event}`);
    });
    return text;
  }

  onCharacterKilled(character) {
    if (character.characterSheet === "hillburrow/bitty-potiok") {
      this.model.failed = true;
      this.pushUniqueEvent("killedBittyPotiok");
    }
  }

  onPointersGivenByBittyPotiok() {
    this.model.addObjective("talkToMercenaryBoss", this.tr("talkToMercenaryBoss"));
    this.pushUniqueEvent("gotPointersFromBitty");
  }

  onMotivesSuggestedByBittyPotiok() {
    this.model.addObjective("confrontBrother", this.tr("confrontBrother"));
    this.pushUniqueEvent("gotMotivesFromBitty");
  }

  onTalkedWithMercenaryBoss() {
    this.onPointersGivenByBittyPotiok();
    this.model.completeObjective("talkToMercenaryBoss");
    this.pushUniqueEvent("talkedToMercenaryBoss");
  }

  onFoundWaterCarrierDynamite() {
    this.model.addObjective("findWaterCarrierDynamite", this.tr("findWaterCarrierDynamite"));
    this.model.completeObjective("findWaterCarrierDynamite");
    this.pushUniqueEvent("foundWaterCarrierDynamite");
  }

  onWaterCarrierConfessed() {
    this.model.addObjective("confession", this.tr("confession"));
    this.model.completeObjective("confession");
    this.pushUniqueEvent("waterCarrierConfessed");
  }

  onFigureOutSabotageExplosives() {
    this.model.setVariable("knowsAboutDymamite", 1);
    this.pushUniqueEvent("figuredOutExplosives");
  }

  onLearnAboutSabotageTiming() {
    this.model.setVariable("knowsAboutTiming", 1);
    this.pushUniqueEvent("learnedAboutTiming");
  }

  discoverBibinInvolvement() {
    this.model.setVariable("bibinFoundOut", 1);
    this.pushUniqueEvent("discoveredBibinInvolvement");
  }

  startWaterCarrierScene() {
    const self = this;

    if (level.name == "hillburrow-backtown")
      this.setupWaterCarrierScene();
    else
    {
      game.switchToLevel("hillburrow-backtown", "", function() {
        self.setupWaterCarrierScene();
      });
    }
  }

  setupWaterCarrierScene() {
    this.model.setVariable("bittyInterrogatedHobo", 1);
    this.pushUniqueEvent("waterCarrierTakenToBoss");
    level.script.waterCarrierInterrogationScene.initialize();
  }

  get knowsAboutDynamite() {
    return this.model.getVariable("knowsAboutDynamite", 0) == 1;
  }

  get knowsAboutTiming() {
    return this.model.getVariable("knowsAboutTiming", 0) == 1;
  }

  get knowsAboutBibinInvolvment() {
    return this.model.getVariable("bibinFoundOut", 0) == 1;
  }

  get knowsAboutWaterCariedToSlaves() {
    return false; // TODO
  }

  get canWarnPotioksAboutBibin() {
    const objective = "mustWarnPotioksAboutBibin";
    return this.model.hasObjective(objective) && !this.model.isObjectiveCompleted(objective);
  }

  get reportedToMatriarch() {
    return this.model.hasObjective("mustWarnPotioksAboutBibin");
  }

  get matriarchKnowsAboutBibinInvolvement() {
    return this.model.getVariable("matriarchKnwosAboutBibinInvolvement", 0) == 1;
  }

  get foughtWaterCarrier() {
    return this.model.getVariable("foughtHobo", 0) == 1;
  }

  set foughtWaterCarrier(value) {
    this.model.setVariable("foughtHobo", value ? 1 : 0);
    if (value) this.pushUniqueEvent("foughtWaterCarrier");
  }

  get potiokKilledWaterCarrier() {
    return this.model.getVariable("bittyInterrogatedHobo");
  }

  get sentByMatriarch() {
    return this.model.getVariable("sentByMatriarch", 0) == 1;
  }

  set sentByMatriarch(value) {
    this.model.setVariable("sentByMatriarch", value ? 1 : 0);
  }

  completeWaterCarrierRoute() {
    this.model.completeObjective("findCulprit");
    this.model.completed = true;
    this.pushUniqueEvent("reportedFindingsToBitty");
  }

  onSuccess() {
    super.onSuccess();
    game.dataEngine.addReputation("potioks", 45);
    game.dataEngine.addReputation("bibins-band", -20);
  }
}
