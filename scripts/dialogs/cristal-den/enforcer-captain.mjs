import {DialogHelper} from "../helpers.mjs";

export default class extends DialogHelper {
  constructor(dialog) {
    super(dialog);
  }

  getEntryPoint() {
    if (this.firstMeetingCheck())
      return "meeting";
    if (this.patrolQuest && !this.patrolQuest.isObjectiveCrossedOff("report"))
      return `work/patrol/report-${this.patrolQuest.isObjectiveCompleted("patrol") ? "success" : "failure"}`;
  }

  get patrolQuest() { return game.quests.getQuest("cristal-den/copper-patrol"); }

  onAskedForWork() {
    if (!this.dialog.npc.hasVariable("introduced"))
      return "work/ask-name";
  }

  onIntroduced() {
    this.dialog.npc.setVariable("introduced", 1);
  }

  onRefuseIntroduction() {
    game.dataEngine.addReputation("cristal-den", -5);
  }

  askAbout() {
    if (!this.dialog.npc.hasVariable("askedAbout") && game.player.statistics.charisma > 6) {
      this.dialog.npc.setVariable("askedAbout", 1);
      return "about-enforcers/confusion";
    }
  }

  workEntry() {
    const reputation = game.dataEngine.getReputation("cristal-den");
    if (reputation > 50)
      return { textKey: "work/entry-good-rep", mood: "smile" };
    else if (reputation < -50)
      return { textKey: "work/entry-bad-rep", answers: [] };
  }

  startPatrolQuest() {
    game.quests.addQuest("cristal-den/copper-patrol");
  }

  get patrolWorkReward() {
    return this.dialog.npc.getVariable("capsReward", 100);
  }

  set patrolWorkReward(value) {
    this.dialog.npc.setVariable("capsReward", value);
  }

  get patrolWorkIncreasedReward() {
    return Math.ceil(this.patrolWorkReward * 1.5);
  }

  hasNegociatedPatrolReward() {
    return this.dialog.npc.hasVariable("patrolRewardNegociated");
  }

  canNegociatePatrolReward() {
    return game.player.statistics.barter >= 60;
  }

  onNegociatePatrolReward() {
    this.dialog.npc.setVariable("patrolRewardNegociated", 1);
    if (game.dataEngine.getReputation("cristal-den") > 10) {
      this.patrolWorkReward = this.patrolWorkIncreasedReward;
      return "work/patrol/negociate-pay-success";
    }
  }

  onReportPatrolSuccess() {
    game.player.inventory.addItemOfType("bottlecaps", this.patrolWorkReward);
    this.patrolQuest.completed = true;
    this.patrolQuest.completeObjective("report");
  }

  onReportPatrolFailure() {
    this.patrolQuest.failed = true;
    this.patrolQuest.completeObjective("report");
  }
}
