import {Innkeeper} from "../innkeeper.mjs";
import {skillContest} from "../../cmap/helpers/checks.mjs";
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
import {isHelpfulQuestAvailable} from "../../quests/junkville/findHelpful.mjs";
import {opinionVarName} from "../../scenes/junkville/negociationAssembly.mjs";

class Dialog extends Innkeeper {
  constructor(dialog) {
    super(dialog);
  }

  getEntryPoint() {
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

  availableHauntedHeapQuest() {
    return !game.quests.hasQuest("junkvilleDumpsDisappeared");
  }
  
  jobs() {
    if (this.availableHauntedHeapQuest())
      return this.dialog.t("job-haunted-heap");
    if (isHelpfulQuestAvailable())
      return this.dialog.t("job-find-helpful");
    return this.dialog.t("no-jobs");
  }

  isHelpfulQuestAvailable_() { return !this.availableHauntedHeapQuest() && isHelpfulQuestAvailable(); }

  acceptHauntedHeapQuest() {
    const object = requireQuest("junkvilleDumpsDisappeared", QuestFlags.NormalQuest);
    object.setVariable("initBy", this.dialog.npc.objectName);
  }

  acceptFindHelpfulQuest() {
    const object = requireQuest("junkville/findHelpful", QuestFlags.NormalQuest);
    object.setVariable("initBy", this.dialog.npc.objectName);
  }
  
  get junkvilleDumpsDisappeared() {
    return game.quests.getQuest("junkvilleDumpsDisappeared");
  }

  hasHauntedDumpQuest() {
    const quest = this.junkvilleDumpsDisappeared;
    return quest && ((!quest.completed && !quest.failed) || (!quest.isObjectiveCompleted("report-success")));
  }

  availableHauntedDumpQuest() {
    return !game.quests.hasQuest("junkvilleDumpsDisappeared") ;
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

  onDogsBattlePeacemaingAppease() {
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

export function create(dialog) {
  return new Dialog(dialog);
}
