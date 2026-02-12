import {QuestHelper} from "../helpers.mjs";

const questName = "cristal-den/happy-pills";
const itemName = "party-time-mint-als";

export default class extends QuestHelper {
  constructor(model) {
    super(model);
    this.itemName = itemName;
  }

  initialize() {
    this.model.location = "cristal-den";
    this.model.addObjective("fetchSample", this.tr("fetch-sample"));
  }

  get xpReward() {
    let reward = 1750;
    if (this.model.isObjectiveCompleted("helpCook"))
      reward += 1000;
    if (this.model.isObjectiveCompleted("testBatch"))
      reward += 750;
    return reward;
  }

  getDescription() {
    let text = this.tr("description");
    if (this.model.isObjectiveCompleted("bringSample")) {
      text += `<p>${this.tr("desc-brought-sample")}`;
      if (this.model.hasObjective("helpCook"))
        text += ` ${this.tr("desc-help-cook")}`;
      text += "</p>";
    }
    if (this.model.hasObjective("testBatch")) {
      text += `<p>${this.tr("desc-test")}`;
      if (this.model.hasVariable("playerTested"))
        text += ` ${this.tr("desc-guinea-pig")}`;
      if (this.model.isObjectiveCompleted("testBatch"))
        text += ` ${this.tr("desc-test2")}</p>`;
    }
    return text;
  }

  completeObjective(objective) {
    if (objective === "testBatch")
      this.model.completed = true;
  }

  onSuccess() {
    game.dataEngine.addReputation("cristal-den", 20);
    level.findGroup("chem-store").script.addPartyTimeMintalsToStock();
  }

  onItemPicked(item) {
    if (item.itemType == this.itemName) {
      this.model.completeObjective("fetchSample");
      this.model.addObjective("bringSample", this.tr("bring-sample"));
    }
  }

  startPreparation(iteration = 1) {
    this.model.setVariable("batchIteration", iteration);
    this.model.setVariable("batchStartedAt", game.timeManager.getTimestamp());
  }

  startPreparationWithHelp() {
    this.model.setVariable("batchIteration", 1);
    this.model.addObjective("helpCook", this.tr("help-cook"));
    game.asyncAdvanceTime(24 * 60, () => {
      this.model.completeObjective("helpCook");
    });
  }

  isPreparationDone() {
    const startedAt = this.model.getVariable("batchStartedAt", 0);
    const duration = 7 * 24 * 60 * 60;
    return startedAt > 0 && startedAt + duration <= game.timeManager.getTimestamp();
  }

  startTesting() {
    this.startPreparation(2);
  }

  startTestingOnPlayer() {
    this.model.setVariable("playerTested", 1);
    this.model.setVariable("batchIteration", 2);
    this.model.addObjective("testBatch", this.tr("test-batch"));
    game.asyncAdvanceTime(24 * 60, () => {
      this.model.completeObjective("testBatch");
    });
  }

  isTestingDone() {
    const startedAt = this.model.getVariable("batchStartedAt", 0);
    const duration = 24 * 60 * 60;
    return startedAt > 0 && startedAt + duration <= game.timeManager.getTimestamp();
  }

  get batchInProgress() {
    return parseInt(this.model.getVariable("batchIteration", 0));
  }
}
