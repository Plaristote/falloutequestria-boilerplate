import {Innkeeper} from "../innkeeper.mjs";
import {skillCheck, skillContest} from "../../cmap/helpers/checks.mjs";
import {requireQuest, QuestFlags} from "../../quests/helpers.mjs";
import {
  areCaptorsDead,
  hasFoundDisappearedPonies
} from "../../quests/junkvilleDumpsDisappeared.mjs";
import {
  startUndergroundBattle,
  hasAltLeaderTakenOver,
  hasMediationStarted
} from "../../quests/junkvilleNegociateWithDogs.mjs";
import {isHelpfulQuestAvailable, teleportToCaverns as helpfulQuestGoToCaverns} from "../../quests/junkville/findHelpful.mjs";
import {opinionVarName} from "../../scenes/junkville/negociationAssembly.mjs";
import {
  hasCavernBanditsQuest,
  canReportNestLocationToRandy,
  banditsCleared,
  banditsResolution,
  banditsDefeatedWithJunkvilleHelp,
  reportedToRandy,
  startBanditsRaidWithRandy,
  startBanditsRaidSolo,
  randyShouldReprimandAboutFleeingBanditBattle
} from "../../quests/junkville/cavernBandits.mjs";

export default class Dialog extends Innkeeper {
  constructor(dialog) {
    super(dialog);
  }

  getEntryPoint() {
    if (randyShouldReprimandAboutFleeingBanditBattle())
      return "bandits/ran-away-earful";
    if (this.dialog.npc.script.shouldTalkAboutDogDealDecision())
      return this.negociateDealEntryPoint();
    return "entry";
  }

  introduction() {
    if (!this.dialog.npc.hasVariable("met")) {
      this.dialog.npc.setVariable("met", true);
      return this.dialog.t("introduction");
    }
  }

  intendantToldAboutLeader() {
    return level.hasVariable("intendantToldAboutLeader");
  }

  shouldRandyBringUpHauntedHeapQuest() {
    const quest = game.quests.getQuest("junkvilleDumpsDisappeared");
    return this.availableHauntedHeapQuest()
        || (!quest.script.hasEvent("talk-to-cook") && quest.inProgress);
  }

  availableBanditsQuestFromRandy() {
    const quest = game.quests.getQuest("junkville/cavernBandits");
    return !quest || !quest.script.talkedWithRandy;
  }

  jobs() {
    let text = "";

    if (this.shouldRandyBringUpHauntedHeapQuest()) {
      requireQuest("junkvilleDumpsDisappeared", QuestFlags.HiddenQuest).script.onHeardAboutQuestFromRandy();
      text += `<p>${this.dialog.t("job-haunted-heap")}</p>`;
    }
    if (isHelpfulQuestAvailable()) {
      text += `<p>${this.dialog.t("job-find-helpful")}</p>`;
    }
    if (this.availableBanditsQuestFromRandy()) {
      text += `<p>${this.dialog.t("job-bandits")}</p>`;
    }
    return text.length > 0 ? text : this.dialog.t("no-jobs");
  }

  isHelpfulQuestAvailable_() { return !this.availableHauntedHeapQuest() && isHelpfulQuestAvailable(); }

  acceptHauntedHeapQuest() {
    const object = requireQuest("junkvilleDumpsDisappeared", QuestFlags.NormalQuest);

    if (!object.hasVariable("initBy"))
      object.setVariable("initBy", this.dialog.npc.objectName);
    object.script.pushUniqueEvent("talk-to-cook");
  }

  acceptFindHelpfulQuest() {
    const object = requireQuest("junkville/findHelpful", QuestFlags.NormalQuest);
    object.setVariable("initBy", this.dialog.npc.objectName);
  }

  acceptBanditsQuest() {
    let eventName = game.quests.hasQuest("junkville/cavernBandits")
      ? "talked-with-cook"
      : "given-by-cook";
    const object = requireQuest("junkville/cavernBandits", QuestFlags.NormalQuest);
    object.script.pushUniqueEvent(eventName);
  }

  canReportHelpfulFound() {
    const quest = game.quests.getQuest("junkville/findHelpful");
    return quest && quest.isObjectiveCompleted("find-helpful") && !quest.isObjectiveCompleted("save-helpful") && !quest.hasVariable("died");
  }

  reportHelpfulFoundLine() {
    const quest = game.quests.getQuest("junkville/findHelpful");
    if (quest && !quest.hasVariable("initBy"))
      return this.dialog.tr("report-found-helpful-alt");
  }

  onFoundHelpful() {
    helpfulQuestGoToCaverns();
  }
  
  get junkvilleDumpsDisappeared() {
    return game.quests.getQuest("junkvilleDumpsDisappeared");
  }

  availableHauntedHeapQuest() {
    return !game.quests.hasQuest("junkvilleDumpsDisappeared");
  }

  hasHauntedDumpQuest() {
    const quest = this.junkvilleDumpsDisappeared;
    const res = game.quests.hasQuest("junkvilleDumpsDisappeared") && (quest.inProgress || (!quest.isObjectiveCompleted("report-success")));
    console.log("hasHauntedDumpQuest", res);
    return res;
  }

  canReportMissingScavengersInJobs() {
    let res = false;
    if (this.shouldRandyBringUpHauntedHeapQuest())
      res = this.hasHauntedDumpQuest();
    console.log("canReportMissingScavengersInJobs", res);
    return res;
  }

  reportDisappearedLocation() {
    const quest = requireQuest("junkvilleNegociateWithDogs");

    if (quest.isObjectiveCompleted("junkville-warned"))
      quest.completeObjective("junkville-warned");
  }

  hauntedDumpDisappearedFound() {
    return this.junkvilleDumpsDisappeared && this.junkvilleDumpsDisappeared.isObjectiveCompleted("find-disappeared");
  }

  hauntedDumpDisappearedDone() {
    return this.junkvilleDumpsDisappeared && this.junkvilleDumpsDisappeared.isObjectiveCompleted("save-captives");
  }

  hauntedDumpAreCaptiveAllDead() {
    return this.junkvilleDumpsDisappeared.script.captiveAllDead();
  }

  hauntedDumpAreCaptiveAllAlive() {
    return this.junkvilleDumpsDisappeared.script.captiveAlive();
  }
  
  hauntedDumpOnReport() {
    if (this.hauntedDumpAreCaptiveAllAlive()) {
      return this.dialog.t("scavengers/report-freed");
    }
    return this.dialog.t("scavengers/report-freed-with-dead");
  }

  hauntedHeapTakeReward() {
    game.player.inventory.addItemOfType("bottlecaps", 150);
  }
  
  hauntedHeapLeaveReward() {
    game.dataEngine.addReputation("junkville", 75);
  }

  hasDogMediationQuest() {
    if (game.quests.hasQuest("junkvilleNegociateWithDogs"))
      return requireQuest("junkvilleNegociateWithDogs").inProgress;
    return false;
  }

  hasDogTradeRoute() {
    return this.dogsStillAlive() && requireQuest("junkvilleNegociateWithDogs").getVariable("mediation") == "trade";
  }

  hasDogZoneRoute() {
    return this.dogsStillAlive() && requireQuest("junkvilleNegociateWithDogs").getVariable("mediation") == "zone";
  }

  dogsHoldingHostages() {
    const quest = requireQuest("junkvilleDumpsDisappeared");
    return !quest.isObjectiveCompleted("save-captives");
  }

  dogsKilledHostages() {
    const quest = requireQuest("junkvilleDumpsDisappeared");
    return quest.getScriptObject().captiveKilledByDogs();
  }

  dogsAlreadyDead() {
    return areCaptorsDead();
  }

  dogsStillAlive() {
    return !areCaptorsDead();
  }

  dogsCompleteNegociationQuest() {
    const quest = requireQuest("junkvilleNegociateWithDogs", 1);
    quest.completed = true;
  }

  onDogMediationEntry() {
    const quest = requireQuest("junkvilleNegociateWithDogs");

    if (quest.isObjectiveCompleted("junkville-warned"))
      return this.dialog.t("dogs-mediation-reentry");
    quest.completeObjective("junkville-warned");
    return this.dialog.t("dogs-mediation-entry");
  }

  onMediationProposal() {
    if (!this.hauntedDumpDisappearedFound()) {
      requireQuest("junkvilleDumpsDisappeared");
      return "dogs-negociation-disappeared";
    }
    else if (hasAltLeaderTakenOver())
      return "dogs-negociation-failed";
    else if (this.dogsKilledHostages())
      return "dogs-negociation-killed";
    else if (this.dogsHoldingHostages())
      return "dogs-negociation-hostages";
    return "dogs-negociation-accept";
  }

  onDogsMediationMustRelease() {
    requireQuest("junkvilleNegociateWithDogs").setVariable("mustReleaseDogs", true);
  }

  mediationAccepted() {
    requireQuest("junkvilleNegociateWithDogs").setVariable("mediation-accepted", true);
    return this.hasDogTradeRoute() ?
      this.dialog.t("dogs-negociation-accept-trade") : this.dialog.t("dogs-negociation-accept");
  }

  dogsBattleCanAppease() {
    return game.player.statistics.speech > 90;
  }

  dogsBattlePeacemakingLine() {
    if (this.dogsBattleCanAppease())
      return this.dialog.t("dogs-battle-peacemaking-convince-success");
    return this.dialog.t("dogs-battle-peacemaking-convince");
  }

  onDogsBattlePeacemakingAppease() {
    if (this.dogsBattleCanAppease())
      return "dogs/battle/peacemaking-appeased";
    return "dogs/battle/peacemaking-not-appeased";
  }

  onAskReward() {
    if (this.improvedBattleReward === undefined) {
      requireQuest("junkvilleNegociateWithDogs").setVariable("battleReward", 100);
    } else if (this.improvedBattleReward) {
      requireQuest("junkvilleNegociateWithDogs").setVariable("battleReward", 200);
      return this.dialog.t("dogs-battle-ask-reward-improved");
    } else {
      return this.dialog.t("dogs-battle-ask-reward-fail");
    }
  }

  canAskBetterReward() {
    return this.improvedBattleReward === undefined;
  }

  askBetterReward() {
    const winner = skillContest(game.player, this.dialog.npc, "barter")

    this.improvedBattleReward = winner === game.player;
  }

  canGetBattleReward() {
    const quest = game.quests.getQuest("junkvilleNegociateWithDogs");
    if (quest && quest.isObjectiveCompleted("win-battle"))
      return quest.getVariable("battleReward") > 0;
    return false;
  }

  giveBattleReward() {
    game.player.inventory.addItemOfType("bottlecaps",
      requireQuest("junkvilleNegociateWithDogs").getVariable("battleReward")
    );
  }

  startBattle() {
    startUndergroundBattle();
  }

  startBattleWithoutPlayer() {
    this.dialog.npc.tasks.addTask("headTowardsBattle", 1500, 0);
  }

  // NEW VERSION SCAVENGER
  onScavengerReport() {
    if (this.hasFreedScavengers()) {
      this.junkvilleDumpsDisappeared.completeObjective("report-success");
      return "scavengers/report-freed";
    } else if (requireQuest("junkvilleDumpsDisappeared").getVariable("reportedScavengerFound") == 2) {
      return "scavengers/report-ransom"
    }
    return "scavengers/report";
  }

  scavengerReport() {
    if (!this.junkvilleDumpsDisappeared.script.heardAboutQuestFromRandy)
      return { textKey: "scavengers/report-alt-surprised", mood: "dubious" };
  }

  scavengersKnowLocation() {
    return hasFoundDisappearedPonies();
  }

  scavengersAllDead() {
    return this.junkvilleDumpsDisappeared.script.captiveAllDead();
  }

  canConvinceToPayRansom() {
    return game.player.statistics.speech > 70;
  }

  hasFreedScavengers() {
    return this.junkvilleDumpsDisappeared.isObjectiveCompleted("save-captives");
  }

  scavengersRansomConvinced() {
    game.playerParty.addExperience(50);
    this.junkvilleDumpsDisappeared.setVariable("ransomApproved", 1);
  }

  reportMissingScavengers() {
    requireQuest("junkvilleDumpsDisappeared").setVariable("reportedScavengerFound", 2);
  }

  //
  // BEGIN BANDITS QUEST (Randy's side)
  //
  get banditsQuest() { return game.quests.getQuest("junkville/cavernBandits"); }

  canReportBanditsLocation() {
    return canReportNestLocationToRandy();
  }

  onReportBanditsLocation() {
    this.banditsQuest.completeObjective("report-nest");
    if (banditsCleared()) {
      // The player already dealt with the bandits before coming back to
      // report - no need to organize anything, just close the loop.
      this.banditsQuest.completeObjective("reported-to-randy");
      switch (banditsResolution()) {
        case "junkville-help": return "bandits/nest-report-already-cleared-together";
        case "dogs-help":      return "bandits/nest-report-already-cleared-dogs";
        default:                return "bandits/nest-report-already-cleared-solo";
      }
    }
    return "bandits/nest-report";
  }

  acceptRandyJoinsBandits() {
    startBanditsRaidWithRandy();
  }

  declineRandyJoinsBandits() {
    startBanditsRaidSolo();
  }

  get banditsReward() {
    return this.banditsQuest.getVariable("randyReward", 0);
  }

  set banditsReward(value) {
    this.banditsQuest.setVariable("randyReward", value);
  }

  canNegotiateBanditsReward() {
    return this.improvedBanditsReward === undefined;
  }

  negotiateBanditsReward() {
    const winner = skillContest(game.player, this.dialog.npc, "barter");

    this.improvedBanditsReward = winner === game.player;
    this.banditsReward = this.improvedBanditsReward ? 150 : 100;
    return this.improvedBanditsReward ? "bandits/negotiate-success" : "bandits/negotiate-failure";
  }

  banditsRanAwayEarful() {
    this.banditsQuest.setVariable("ranAwayTalkedWithRandy", 1);
  }

  canReportBanditsBattle() {
    return hasCavernBanditsQuest() && banditsCleared() && !reportedToRandy();
  }

  onReportBanditsBattle() {
    this.banditsQuest.completeObjective("reported-to-randy");
    game.player.inventory.addItemOfType("bottlecaps", this.banditsReward);
    switch (banditsResolution()) {
      case "junkville-help": return "bandits/battle-report-together";
      case "dogs-help":      return "bandits/battle-report-dogs";
      default:                return "bandits/battle-report-solo";
    }
  }

  // Randy needs a lot less convincing about the diamond dogs if Junkville
  // folk already bled next to them against the bandits - it's proof enough
  // that peace is possible.
  banditsHelpedByJunkville() {
    return banditsDefeatedWithJunkvilleHelp();
  }

  negociateCiteBanditsHelp() {
    this.negociationPoints = 3;
    return "dogs/negociations/step-5-convinced";
  }

  // NEW VERSION NEGOCIATE
  negociateCanTellDogsWantNegociate() {
    const quest = requireQuest("junkvilleNegociateWithDogs");
    return hasMediationStarted() && !quest.isObjectiveCompleted("pass-on-message");
  }

  negociateTellDogsWantToNegociate() {
    return this.hasFreedScavengers() ? "dogs/negociations/start-step-1" : "dogs/negociations/captives-not-freed";
  }

  negociateCanExposeDemandsNicely() {
    return game.player.statistics.speech > 70;
  }

  negociationStart() {
    this.negociationPoints = 0;
  }

  negociationIncreasePoints() {
    this.negociationPoints += 1;
  }

  negociationDecreasePoints() {
    this.negociationPoints -= 1;
  }

  negociationEnd() {
    console.log("negociationEnd with", this.negociationPoints, "points.");
    if (this.negociationPoints > 2)
      return "dogs/negociations/step-5-convinced";
    else if (this.negociationPoints < 0)
      return "dogs/negociations/step-5-angered";
    return "dogs/negociations/step-5-neutral";
  }

  negociationStartAssembly() {
    const quest = requireQuest("junkvilleNegociateWithDogs");
    quest.completeObjective("pass-on-message");
    this.dialog.npc.setVariable(opinionVarName, this.negociationPoints - 1);
    level.script.setupNegociationAssembly();
  }

  negociateBattleCanBeCancelled() {
    const quest = requireQuest("junkvilleNegociateWithDogs");
    return !quest.hasVariable("junkvilleDecision");
  }

  negociatePassOnJunkvilleDecision() {
    const quest = requireQuest("junkvilleNegociateWithDogs");
    quest.setVariable("passOnJunkvilleDecision", 1);
  }

  negociateDealEntryPoint() {
    const quest = requireQuest("junkvilleNegociateWithDogs");

    switch (quest.getVariable("junkvilleDecision")) {
      case "accept": return "dogs/deal-accepted";
      case "reject": return "dogs/deal-rejected";
      case "war":    return "dogs/deal-war";
    }
  }

  onDogsMediationStart() {
    const quest = requireQuest("junkvilleNegociateWithDogs");

    if (quest.hasVariable("junkvilleDecision")) {
      const choice = this.negociateDealEntryPoint();
      if (choice) return choice;
    }
    if (quest.isObjectiveCompleted("pass-on-message") && level.tasks.hasTask("waitForAssembly"))
      return "dogs/negociations/wait-assembly";
    return "dogs/negociations/entry";
  }
}
