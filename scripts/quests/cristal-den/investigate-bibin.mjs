import {QuestHelper} from "../helpers.mjs";

export class InvestigateBibin extends QuestHelper {
  initialize() {
    this.model.location = "cristal-den";
    this.model.addObjective("findEvidence");
  }

  getDescription() {
    let text = `<p>${this.model.tr("description")}</p>`;

    if (this.mustSneak)
      text += `<p>${this.model.tr("desc-sneaky-job")}</p>`;
    if (this.metHerdLeader)
      text += `<p>${this.model.tr("desc-met-herd-leader")}</p>`;
    else if (this.hasNoteEvidence)
      text += `<p>${this.model.tr("desc-found-note")}</p>`;
    if (this.model.completed)
      text += `<p>${this.model.tr("desc-completed")}</p>`;
    return text;
  }

  get mustSneak() {
    if (!this.isObjectiveCompleted("findEvidence") && game.diplomacy.areEnemies("player", "bibins-band"))
      this.model.setVariable("bibinEnemy", 1);
    return this.model.getVariable("bibinEnemy", 0);
  }

  get herdSiegeQuest() {
    return game.quests.getQuest("cristal-den/bibins-rescue-herd");
  }

  get metHerdLeader() {
    return this.herdSiegeQuest && this.herdSiegeQuest.script.hasEvent("met-herd-leader");
  }

  get hasNoteEvidence() {
    return this.hasEvent("read-outpost-note");
  }

  canReportOutpostNote() {
    const outpostQuest = game.quests.getQuest("cristal-den/copper-outpost");
    return this.hasNoteEvidence && outpostQuest?.script?.reportedGoldenHerdInvolvement === true;
  }

  isObjectiveCompleted(name) {
    if (name === "findEvidence" && (this.metHerdLeader || this.hasNoteEvidence))
      return true;
    return null;
  }

  completeObjective(name) {
    switch (name) {
      case "confirmTies":
        this.model.completed = true;
        break;
    }
  }
}
