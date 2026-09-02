// TODO: confirm relative import path once this file's final location in the
// quests tree is known (mirrors changelingQuest.mjs's "./helpers.mjs").
import {QuestHelper} from "../helpers.mjs";

export default class extends QuestHelper {
  initialize() {
    this.model.location = "unhaus";
    this.model.addObjective("find-hive");
  }

  getDescription() {
    let text = `<p>${this.model.tr("description")}</p>`;

    if (this.model.completed)
      text += `<p>${this.model.tr("desc-solved")}</p>`;
    return text;
  }

  onDiscoveredHive() {
    this.model.completeObjective("find-hive");
    this.model.completed = true;
  }
}
