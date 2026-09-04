import {QuestHelper} from "../helpers.mjs";

export const BacktrackState = {
  Unknown: 0,
  LeftHive: 1,
  FedHive: 2
};

export default class extends QuestHelper {
  initialize() {
    this.model.location = "unhaus";
    this.model.addObjective("find-hive");
  }

  getDescription() {
    let text = `<p>${this.model.tr("description")}</p>`;
    this.events.forEach(event => {
      text += "<p>" + this.model.tr(`desc-${event}`) + "</p>";
    })
    if (this.model.completed)
      text += `<p>${this.model.tr("desc-solved")}</p>`;
    return text;
  }

  onDiscoveredHive() {
    this.model.completeObjective("find-hive");
    this.model.completed = true;
  }

  onBacktrackGaveQuest() {
    this.pushUniqueEvent("backtrack-gave-quest");
  }

  onFargoGaveQuest() {
    this.pushUniqueEvent("fargo-gave-quest");
  }

  onBacktrackSafelyLeftHive() {
    this.model.setVariable("backtrack", BacktrackState.LeftHive);
  }

  onBacktrackDiedInHive() {
    this.model.setVariable("backtrack", BacktrackState.FedHive);
  }
}
