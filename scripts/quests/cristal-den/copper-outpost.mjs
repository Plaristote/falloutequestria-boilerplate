import {QuestHelper, QuestFlags, requireQuest} from "../helpers.mjs";
import {skillCheck} from "../../cmap/helpers/checks.mjs";

function createOutpost() {
  const outpost = game.worldmap.createCity("cristal-den-outpost");

  outpost.level = "cristal-den-outpost";
  outpost.position.x = 1000;
  outpost.position.y = 1865;
  outpost.size = 20;
  game.worldmap.revealCity(outpost);
  return outpost;
}

function countLiveWolves() {
  return level.findGroup("wolves").objects.filter(wolf => wolf.isAlive()).length;
}

export default class extends QuestHelper {
  constructor(model) {
    super(model);
    this.metaQuest = requireQuest("cristal-den/copper", QuestFlags.HiddenQuest);
    this.xpReward = 450;
  }

  initialize() {
    createOutpost();
    this.model.location = "cristal-den-outpost";
    this.model.addObjective("investigate");
    this.model.addObjective("report");
  }

  get reportedGoldenHerdInvolvement() {
    return this.model.getVariable("full-report", 0) == 2;
  }

  getDescription() {
    let text = `<p>${this.model.tr("description")}</p>`;

    if (this.model.isObjectiveCompleted("investigate")) {
      if (this.model.getVariable("found-wolves"))
        text += `<p>${this.model.tr("desc-wolves")} `;
      else
        text += `<p>${this.model.tr("desc-wolves-not-found")} `;
      if (this.model.isObjectiveCompleted("kill-wolves"))
        text += this.model.tr("desc-wolves-killed") + ' ';
      text += this.model.tr("desc-death");
      if (this.model.getVariable("inspect-body-success", 0) == 1)
        text += ' ' + this.model.tr("desc-death-by-firearms");
      text += "</p>";
      if (this.model.getVariable("found-herd-body", 0) == 1)
        text += `<p>${this.model.tr("desc-found-herd")}</p>`;
    }
    if (this.model.isObjectiveCompleted("report")) {
      if (this.reportedGoldenHerdInvolvement)
        text += `<p>${this.model.tr("desc-full-report")}</p>`;
      else if (this.model.getVariable("found-herd-body", 0) == 1 && this.model.getVariable("full-report", 0) < 2)
        text += `<p>${this.model.tr("desc-lied-herd")}</p>`;
      else if (this.model.getVariable("full-report", 0) == 0)
        text += `<p>${this.model.tr("desc-report-failure")}</p>`;
      else
        text += `<p>${this.model.tr("desc-report-default")}</p>`;
    }
    return text;
  }

  onSuccess() {
    super.onSuccess();
    this.metaQuest.completeObjective("outpost");
    game.dataEngine.addReputation("cristal-den", 25);
  }

  onFailure() {
    super.onFailure();
    game.dataEngine.addReputation("cristal-den", -15);
  }

  onCharacterKilled() {
    if (typeof level != "undefined" && level.name === "cristal-den-outpost" && countLiveWolves() == 0)
      this.model.completeObjective("kill-wolves");
  }

  inspectScoutBodyTest() {
    let success = this.model.getVariable("inspect-body-success", 0) === 1;

    if (!success) {
      success = skillCheck(game.player, "perception", { dice: 3, target: 7 });
      this.model.setVariable("inspect-body-success", success ? 1 : 0);
    }
    return success;
  }

  inspectHerdBodyTest() {
    let success = this.model.getVariable("found-herd-body", 0) === 1;

    if (!success) {
      success = skillCheck(game.player, "perception", { dice: 3, target: 5 });
      this.model.setVariable("found-herd-body", success ? 1 : 0);
    }
    return success;
  }
}
