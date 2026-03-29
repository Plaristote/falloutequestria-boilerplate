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
