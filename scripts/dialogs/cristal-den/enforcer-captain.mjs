import {DialogHelper} from "../helpers.mjs";
import {matriarchDead} from "../../quests/cristal-den/potioks.mjs";

export default class extends DialogHelper {
  constructor(dialog) {
    super(dialog);
    this.outpostReportedHerd = false;
    this.outpostCanAskSalary = true;
  }

  getEntryPoint() {
    if (this.firstMeetingCheck())
      return "meeting";
    if (this.patrolQuest && !this.patrolQuest.isObjectiveCrossedOff("report"))
      return `work/patrol/report-${this.patrolQuest.isObjectiveCompleted("patrol") ? "success" : "failure"}`;
  }

  get metaQuest() { return game.quests.getQuest("cristal-den/copper"); }
  get patrolQuest() { return game.quests.getQuest("cristal-den/copper-patrol"); }
  get outpostQuest() { return game.quests.getQuest("cristal-den/copper-outpost"); }
  get isGoldenHerdDestroyed() { return game.getVariable("goldenHerdDestroyedAtThornhoof", 0) == 1; }

  onAskedForWork() {
    if (!this.dialog.npc.hasVariable("introduced"))
      return "work/ask-name";
    if (this.metaQuest)
      return this.followupWorkState();
  }

  followupWorkState() {
    if (this.metaQuest.isObjectiveCrossedOff("outpost"))
      return this.followupJobsOver();
    if (this.metaQuest.isObjectiveCrossedOff("patrol"))
      return "work/outpost/intro";
  }

  followupJobsOver() {
    if (!game.quests.hasQuest("cristal-den/potioks-spy") && !matriarchDead()) {
      game.setVariable("enforcerCaptainSentPlayerToPotioks", 1);
      return "work/send-to-potioks";
    }
    return "work/no-more-work";
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

  startOutpostQuest() {
    game.quests.addQuest("cristal-den/copper-outpost");
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

  get outpostWorkReward() {
    return this.dialog.npc.getVariable("outpostCapsReward", this.patrolWorkReward);
  }

  set outpotWorkReward(value) {
    this.dialog.npc.setVariable("outpostCapsReward", value);
  }

  get outpostWorkIncreasedReward() {
    return this.outpotWorkReward + 75;
  }

  hasNegociatedPatrolReward() {
    return this.dialog.npc.hasVariable("patrolRewardNegociated");
  }

  hasNegociatedOutpostReward() {
    return this.dialog.npc.hasVariable("outpostRewardNegociated");
  }

  canNegociatePatrolReward() {
    return game.player.statistics.barter >= 55;
  }

  canNegociateOutpostReward() {
    return game.player.statistics.barter >= 65;
  }

  onNegociatePatrolReward() {
    this.dialog.npc.setVariable("patrolRewardNegociated", 1);
    if (game.dataEngine.getReputation("cristal-den") > 10) {
      this.patrolWorkReward = this.patrolWorkIncreasedReward;
      game.playerParty.addExperience(25);
      return "work/patrol/negociate-pay-success";
    }
  }

  onNegociateOutpostReward() {
    this.dialog.npc.setVariable("outpostRewardNegociated", 1);
    if (this.patrolQuest.isObjectiveCompleted("patrol")) {
      this.outpostWorkReward = this.outpostWorkIncreasedReward;
      game.playerParty.addExperience(50);
      return "work/outpost/negociate-pay-success";
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

  outpostReportPrompt() {
    const prefix = "work/outpost/report"
    switch (this.dialog.previousAnswer) {
    case "outpost-report-herd":
      this.outpostReportedHerd = true;
      return { textKey: `${prefix}/on-herd-found`, mood: "sad" };
    case "outpost-report-firearms":
      this.outpostReportedFirearms = true;
      return { textKey: `${prefix}/on-firearms-used`, mood: "neutral" };
    case "outpost-report-wolves":
      this.outpostReportedWolves = true;
      return { textKey: `${prefix}/on-wolves-found`, mood: "dubious" };
    case "outpost-report-dead-wolves":
      this.outpostReportedDeadWolves = true;
      return { textKey: `${prefix}/on-wolves-killed`, mood: "smile" };
    }
  }

  onOutpostReportDone() {
    this.outpostQuest.completeObjective("report");
    if (this.outpostReportedHerd) {
      this.outpostQuest.setVariable("full-report", 2);
      this.outpostQuest.completed = true;
      return "work/outpost/report/conclusion-with-herd";
    } else if (this.outpostReportedFirearms) {
      this.outpostQuest.setVariable("full-report", 1);
      this.outpostQuest.completed = true;
      return "work/outpost/report/conclusion-vague";
    }
    this.outpostQuest.failed = true;
    return "work/outpost/report/conclusion-failure";
  }

  outpostPayUp() {
    this.outpostCanAskSalary = false;
    game.player.inventory.addItemOfType("bottlecaps", this.outpostWorkReward);
  }

  outpostWorkCanReport() {
    return this.outpostQuest.inProgress && this.outpostQuest.isObjectiveCompleted("investigate");
  }

  outpostWorkCanReportHerd() {
    return this.outpostReportedHerd !== true && this.outpostQuest.getVariable("found-herd-body", 0) == 1;
  }

  outpostWorkCanReportFirearms() {
    return this.outpostReportedFirearms !== true && this.outpostQuest.getVariable("inspect-body-success", 0) == 1;
  }

  outpostWorkCanReportWolves() {
    return this.outpostReportedWolves !== true && this.outpostQuest.hasVariable("found-wolves");
  }

  outpostWorkCanReportDeadWolves() {
    return this.outpostReportedDeadWolves !== true && this.outpostReportedWolves == true && this.outpostQuest.isObjectiveCompleted("kill-wolves");
  }

  get outpostOnWolvesFoundFollowup() {
    if (!this.outpostReportedFirearms && !this.outpostReportedHerd)
      return "<p>" + this.dialog.tr("work/outpost/report/on-wolves-found-followup") + "</p>";
    return "";
  }
}
