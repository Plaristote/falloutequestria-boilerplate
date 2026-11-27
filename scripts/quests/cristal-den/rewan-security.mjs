import {QuestHelper} from "../helpers.mjs";
import {isHeirDead} from "./potioks.mjs";
import {markHeirDebriefed, hasReportedHeir} from "./heir-selection.mjs";

const questName = "cristal-den/rewan-security";

export function rewanSecurityQuestCanStart() {
  return !isHeirDead("rewan") && !game.quests.hasQuest(questName);
}

export function rewanSecurityQuestCanReport() {
  const quest = game.quests.getQuest(questName);

  return !isHeirDead("rewan") && !!quest && quest.completed && !hasReportedHeir("rewan");
}

// PLACEHOLDER: the real quest (Rewan's slave-powered mine/factory losing
// slaves to thieves) isn't designed yet. Taking the job completes it at
// once, so the Matriarch's debrief and heir selection can be played through.
export function rewanSecurityAcceptToGo() {
  const quest = game.quests.addQuest(questName);

  quest.completeObjective("placeholder");
  quest.completed = true;
}

export function rewanSecurityReportedToMatriarch() {
  markHeirDebriefed("rewan");
}

export default class RewanSecurity extends QuestHelper {
  constructor(model) {
    super(model);
    this.xpReward = 50;
  }

  initialize() {
    this.model.location = "cristal-den";
    this.model.addObjective("placeholder", this.tr("placeholder"));
  }
}
