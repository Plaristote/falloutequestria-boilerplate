import {QuestHelper} from "../helpers.mjs";
import {isHeirDead} from "./potioks.mjs";
import {markHeirDebriefed, hasReportedHeir} from "./heir-selection.mjs";

const questName = "cristal-den/crafty-workshop";

export function craftyWorkshopQuestCanStart() {
  return !isHeirDead("crafty") && !game.quests.hasQuest(questName);
}

export function craftyWorkshopQuestCanReport() {
  const quest = game.quests.getQuest(questName);

  return !isHeirDead("crafty") && !!quest && quest.completed && !hasReportedHeir("crafty");
}

// PLACEHOLDER: the real quest (Crafty's workshop, leaning toward farming
// tools and equipment) isn't designed yet. Taking the job completes it at
// once, so the Matriarch's debrief and heir selection can be played through.
export function craftyWorkshopAcceptToGo() {
  const quest = game.quests.addQuest(questName);

  quest.completeObjective("placeholder");
  quest.completed = true;
}

export function craftyWorkshopReportedToMatriarch() {
  markHeirDebriefed("crafty");
}

export default class CraftyWorkshop extends QuestHelper {
  constructor(model) {
    super(model);
    this.xpReward = 50;
  }

  initialize() {
    this.model.location = "cristal-den";
    this.model.addObjective("placeholder", this.tr("placeholder"));
  }
}
