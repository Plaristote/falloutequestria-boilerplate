import {QuestHelper, QuestFlags, requireQuest} from "../helpers.mjs";
import patrolProcess from "../../behaviour/cristal-den/copper-patrol.mjs";

export default class extends QuestHelper {
  constructor(model) {
    super(model);
    this.metaQuest = requireQuest("cristal-den/copper", QuestFlags.HiddenQuest);
    this.xpReward = 300;
  }

  initialize() {
    this.model.location = "cristal-den";
    this.model.addObjective("patrol");
    patrolProcess().start();
  }

  getDescription() {
    let text = `<p>${this.model.tr("description")}</p>`;

    if (this.model.isObjectiveCompleted("patrol"))
      text += `<p>${this.model.tr("desc-success")}</p>`;
    if (this.model.isObjectiveFailed("patrol"))
      text += `<p>${this.model.tr("desc-ran-away")}</p>`;
    return text;
  }

  completeObjective(name) {
    if (name == "patrol")
      this.model.addObjective("report");
  }

  onSuccess() {
    super.onSuccess();
    this.metaQuest.completeObjective("patrol");
    game.dataEngine.addReputation("cristal-den", 25);
  }

  onFailed() {
    super.onFailed();
    this.metaQuest.failObjective("patrol");
    game.dataEngine.addReputation("cristal-den", -50);
  }
}
