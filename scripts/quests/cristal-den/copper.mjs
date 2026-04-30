import {QuestHelper, QuestFlags} from "../helpers.mjs";

const finalQuest = "";

export function enforcersKnowAboutHerdScouts() {
  const outpostQuest = game.quests.getQuest("cristal-den/copper-outpost");
  const herdRescueQuest = game.quests.getQuest("cristal-den/bibin-rescue-herd");

  return (outpostQuest && outpostQuest.script.reportedGoldenHerdInvolvement)
      || (herdRescueQuest && herdRescueQuest.script.locationWasVisited);
}

export default class extends QuestHelper {
  constructor(model) {
    super(model);
    this.xpReward = 2500;
  }

  initialize() {
    this.model.location = "cristal-den";
  }

  completeObjective(name) {
    if (name === finalQuest)
      this.model.completed = true;
  }
}
