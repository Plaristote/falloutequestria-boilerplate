import {DialogHelper} from "../../helpers.mjs";
import {
  canWarnPotioksAboutBibin,
  canReportSabotageToMatriarch,
  sabotageReportedToMatriarch,
  bibinSabotageReportedToMatriarch,
  wasSaboteurInterrogatedByBibin
} from "../../../quests/hillburrow/sabotage.mjs";
import {
  hasPotiokSpyQuest,
  foundPotiokSpy,
  learnedAboutSavageConnection
} from "../../../quests/cristal-den/potioks-spy.mjs";
import {enforcersKnowAboutHerdScouts} from "../../../quests/cristal-den/copper.mjs";
import {RanchAccess} from "../../../levels/cristal-den-ranch.mjs";
import {skillContest} from "../../../cmap/helpers/checks.mjs";
import {hasSuitcaseBeenOpened} from "../../../quests/cristal-den/bibins-sabotage-delivery.mjs";
import {QuestFlags} from "../../../quests/helpers.mjs";

export default class Dialog extends DialogHelper  {
  constructor(dialog) {
    super(dialog);
  }

  getEntryPoint() {
    let entryPoint = "intrusion";

    if (this.dialog.npc.hasVariable("sabotagePrompt")) {
      this.dialog.npc.unsetVariable("sabotagePrompt");
      entryPoint = "sabotage/entry";
    } else if (this.dialog.npc.hasVariable("jobPrompt")) {
      this.dialog.npc.unsetVariable("jobPrompt");
      entryPoint = "sneak-job/apply/entry";
    } else if (this.dialog.npc.hasVariable("met")) {
      entryPoint = "prompt";
    }
    this.dialog.npc.setVariable("met", 1);
    return entryPoint;
  }

  grantAccess() {
    level.setVariable("access", 2);
  }

  wasSentByBitty() {
    return canWarnPotioksAboutBibin();
  }

  wasSentByPat() {
    return level.getVariable("sentByPat", 0) == 1 && !hasPotiokSpyQuest();
  }

  wasSentByEnforcers() {
    return game.getVariable("cristalDenEnforcersRecommendToPotiok", 0) == 1 && !hasPotiokSpyQuest();
  }

  wasSentByBibin() {
    return game.quests.hasQuest("cristal-den/bibins-potiok-assassination");
  }

  // BEGIN Bibin Investigation/Battle
  get investigateBibinQuest() {
    return game.quests.getQuest("cristal-den/investigate-bibin");
  }

  get bibinInvestigationOver() {
    return this.investigateBibinQuest?.completed === true;
  }

  canOfferBibinInvestigation() {
    return this.sneakJobQuest?.completed && !this.investigateBibinQuest;
  }

  get playerIsEnemyWithBibin() {
    return game.diplomacy.areEnemies("player", "bibins-band");
  }

  isPlayerEnemyWithBibin() {
    return this.playerIsEnemyWithBibin;
  }

  get bibinInvestigationReward() {
    return this.dialog.npc.getVariable("bibinInvestigationReward", 750);
  }

  set bibinInvestigationReward(value) {
    this.dialog.npc.setVariable("bibinInvestigationReward", value);
  }

  get bibinInvestigationIncreasedReward() {
    return this.bibinInvestigationReward + 250;
  }

  bibinInvestigationCanNegociateReward() {
    return this.bibinInvestigationReward < 1000;
  }

  bibinInvestigationNegociateReward() {
    if (skillContest(game.player, this.dialog.npc, "barter") == game.player) {
      this.bibinInvestigationReward = this.bibinInvestigationIncreasedReward;
      return "bibin-investigation/offer/negociate-success";
    }
    return "bibin-investigation/offer/negociate-failure";
  }

  startBibinInvestigation() {
    game.quests.addQuest("cristal-den/investigate-bibin");
  }

  get bibinRescueHerdQuest() {
    return game.quests.getQuest("cristal-den/bibins-rescue-herd");
  }

  canOpenBibinReport() {
    return game.quests.hasQuest("cristal-den/investigate-bibin") &&
           (this.canReportHerdConnection() || this.canReportNote() || this.canReportSuitcase());
  }

  get bibinTiesAlreadyConfirmed() {
    return this.investigateBibinQuest?.isObjectiveCompleted("confirmTies") === true;
  }

  canReportHerdConnection() {
    return this.investigateBibinQuest && !this.bibinTiesAlreadyConfirmed
        && this.bibinRescueHerdQuest?.script?.hasEvent("met-herd-leader") === true;
  }

  canReportNote() {
    return this.investigateBibinQuest && !this.bibinTiesAlreadyConfirmed
        && this.investigateBibinQuest.script.canReportOutpostNote();
  }

  canReportSuitcase() {
    return !this.dialog.npc.hasVariable("bibinInvolvedInSabotage") && hasSuitcaseBeenOpened();
  }

  reportHerdConnection() {
    this.confirmBibinTies();
  }

  reportNote() {
    this.confirmBibinTies();
  }

  confirmBibinTies() {
    this.investigateBibinQuest.completeObjective("confirmTies");
    game.player.inventory.addItemOfType("bottlecaps", this.bibinInvestigationReward);
  }

  reportSuitcase() {
    this.dialog.npc.setVariable("bibinInvolvedInSabotage", 1);
  }

  canOrganizeBibinBattle() {
    return this.bibinTiesAlreadyConfirmed
        && !game.quests.hasQuest("cristal-den/bibins-final-battle")
        && !game.quests.hasQuest("cristal-den/bibins-potiok-assassination");
  }

  startBibinBattlePrep() {
    game.quests.addQuest("cristal-den/bibins-final-battle");
  }

  get bibinBattleQuest() {
    return game.quests.getQuest("cristal-den/bibins-final-battle");
  }

  canTriggerBibinBattle() {
    return this.bibinBattleQuest?.inProgress === true;
  }

  canTriggerBibinBattleWithAllSupport() {
    return this.bibinBattleQuest.isObjectiveCompleted("recruitSlavers")
        && this.bibinBattleQuest.isObjectiveCompleted("recruitCaravaneers")
  }

  canTriggerBibinBattleWithCaravanSupport() {
    return !this.bibinBattleQuest.isObjectiveCompleted("recruitSlavers")
        && this.bibinBattleQuest.isObjectiveCompleted("recruitCaravaneers")
  }

  canTriggerBibinBattleWithSlaverSupport() {
    return this.bibinBattleQuest.isObjectiveCompleted("recruitSlavers")
        && !this.bibinBattleQuest.isObjectiveCompleted("recruitCaravaneers")
  }

  triggerBibinBattle() {
    this.bibinBattleQuest.script.startBattle();
  }

  canAskMoreJobs() {
    if (this.canOfferBibinInvestigation())
      return true;
    if (!this.heirsProgramOpen)
      return false;
    if (this.heirJobs.some((job) => job.canStart()))
      return true;
    return canDiscussSuccession();
  }

  askMoreJobs() {
    if (this.canOfferBibinInvestigation())
      return "bibin-investigation/offer/entry";

    const next = this.heirJobs.find((job) => job.canStart());

    if (next)
      return next.entryState;
    if (canDiscussSuccession())
      return "heirs/succession/entry";
    return "no-jobs-available";
  }

  reportOnBitty() {
    this.dialog.npc.setVariable("currentHeirAudit", "bitty");
  }

  reportOnRewan() {
    this.dialog.npc.setVariable("currentHeirAudit", "rewan");
  }

  reportOnCrafty() {
    this.dialog.npc.setVariable("currentHeirAudit", "crafty");
  }

  canReportOnRewan() {
    return rewanSecurityQuestCanReport();
  }

  canReportOnCrafty() {
    return craftyWorkshopQuestCanReport();
  }

  get currentHeirAudit() {
    return this.dialog.npc.getVariable("currentHeirAudit");
  }

  get currentHeirName() {
    return HEIRS[this.currentHeirAudit]?.name;
  }

  rateHeirGood() {
    rateHeir(this.currentHeirAudit, Rating.POSITIVE);
  }

  rateHeirMedium() {
    rateHeir(this.currentHeirAudit, Rating.NEUTRAL);
  }

  rateHeirBad() {
    rateHeir(this.currentHeirAudit, Rating.NEGATIVE);
  }

  rateHeirSkip() {
  }

  continueToHeirReportDetails() {
    return `heirs/${this.currentHeirAudit}/report-details`;
  }

  canSuggestTroutAsHeir() {
    return canSuggestTrout();
  }

  hasRatedBitty() {
    return !isHeirDead("bitty") && hasRatedHeir("bitty");
  }

  hasRatedRewan() {
    return !isHeirDead("rewan") && hasRatedHeir("rewan");
  }

  hasRatedCrafty() {
    return !isHeirDead("crafty") && hasRatedHeir("crafty");
  }

  suggestBitty() {
    suggestHeir("bitty");
  }

  suggestRewan() {
    suggestHeir("rewan");
  }

  suggestCrafty() {
    suggestHeir("crafty");
  }

  suggestTrout() {
    suggestHeir("trout");
  }

  matriarchAgreesWithSuggestion() {
    return true;
  }

  finalizeSuggestedHeir() {
    finalizeHeir(this.currentHeirAudit);
  }

  get knowsAboutGoldenHerdAndBibin() {
    return learnedAboutSavageConnection() || enforcersKnowAboutHerdScouts();
  }

  get sneakJobReward() {
    return this.dialog.npc.getVariable("sneakJobReward", 500);
  }

  set sneakJobReward(value) {
    this.dialog.npc.setVariable("sneakJobReward", value);
  }

  get sneakJobIntroduced() {
    return this.dialog.npc.getVariable("toldAboutSpyJob", 0) == 1;
  }

  set sneakJobIntroduced(value) {
    level.setVariable("canAskForWork", value ? 0 : 1);
    this.dialog.npc.setVariable("toldAboutSpyJob", value ? 1 : 0);
  }

  sneakJobIntroduce() {
    this.sneakJobIntroduced = true;
  }

  sneakJobCanNegociateReward() {
    return this.sneakJobReward < 750;
  }

  sneakJobNegociateReward() {
    if (skillContest(game.player, this.dialog.npc, "barter") == game.player) {
      this.sneakJobReward = 750;
      return "sneak-job/increase-reward";
    }
    return "sneak-job/reward-not-increased";
  }

  sneakJobAccepted() {
    game.quests.addQuest("cristal-den/potioks-spy");
  }

  sneakJobCanReenter() {
    return this.sneakJobIntroduced && !hasPotiokSpyQuest();
  }

  get sneakJobQuest() {
    return game.quests.getQuest("cristal-den/potioks-spy");
  }

  sneakJobIsOngoing() {
    return this.sneakJobQuest && this.sneakJobQuest.inProgress;
  }

  sneakJobSpyKilled() {
    return this.sneakJobQuest && this.sneakJobQuest.getVariable("killedSpy", 0) == 1;
  }

  sneakJobHasFoundSpy() {
    return this.sneakJobQuest && this.sneakJobQuest.isObjectiveCompleted("findSpy");
  }

  sneakJobSpyFoundAndAlive() {
    return this.sneakJobHasFoundSpy() && !this.sneakJobQuest.isObjectiveCompleted("solveSpy");
  }

  sneakJobSpySolved() {
    return this.sneakJobQuest.isObjectiveCompleted("solveSpy");
  }

  sneakJobSpyTalked() {
    return this.sneakJobQuest.isObjectiveCompleted("learnAboutConfession");
  }

  sneakJobSavageConnection() {
    return this.sneakJobQuest.isObjectiveCompleted("learnAboutSavageConnection");
  }

  sneakJobFinished() {
    game.player.inventory.addItemOfType("bottlecaps", this.sneakJobReward);
    this.sneakJobQuest.completeObjective("report");
  }

  saboteurWasInterrogated() {
    return wasSaboteurInterrogatedByBibin();
  }

  saboteurCanReport() {
    return canReportSabotageToMatriarch();
  }

  get saboteurQuest() {
    return game.quests.getQuest("hillburrow/sabotage");
  }

  saboteurAcceptToGo() {
    const quest = game.quests.addQuest("hillburrow/sabotage", QuestFlags.HiddenQuest);

    game.worldmap.revealCity("hillburrow");
    quest.script.sentByMatriarch = true;
  }

  saboteurCanTellAboutBibinInvolvement() {
    return !this.dialog.npc.hasVariable("bibinInvolvedInSabotage");
  }

  saboteurToldAboutBibinInvolvement() {
    this.dialog.npc.setVariable("bibinInvolvedInSabotage", 1);
  }

  endSabotageReport() {
    sabotageReportedToMatriarch();
  }

  endSabotageReportWithBibinInvolvement() {
    bibinSabotageReportedToMatriarch();
  }
}
