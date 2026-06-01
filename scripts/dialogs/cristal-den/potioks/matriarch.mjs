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

class Dialog {
  constructor(dialog) {
    this.dialog = dialog;
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

  wasSentByBibin() {
    return false;
  }

  canAskMoreJobs() {
    if (this.sneakJobQuest?.completed) {
      if (this.saboteurQuestCanStartOrReport())
        return true;
    }
    return false;
  }

  askMoreJobs() {
    if (this.saboteurQuestCanStartOrReport())
      return "sabotage/init/entry";
    else if (this.saboteurQuest?.completed && !game.quests.hasQuest("cristal-den/investigate-bibin")) {
      if (this.knowsAboutGoldenHerdAndBibin)
        return "bibin-job/init/entry-herd";
      else if (bibinSabotageReportedToMatriarch())
        return "bibin-job/init/entry-no-herd";
    }
    return "no-jobs-available";
  }

  get investigateBibinQuest() {
    return game.quests.getQuest("cristal-den/investigate-bibin");
  }

  investigateBibinQuestStart() {
    if (!game.quests.hasQuest("cristal-den/investigate-bibin"))
      game.quests.addQuest("cristal-den/investigate-bibin");
  }

  investigateBibinAskAboutSuspicions() {
    if (learnedAboutSavageConnection())
      return "bibin-job/init/suspicions-spy";
    return "bibin-job/init/suspicions-hunch";
  }

  investigateBibinAskAboutHerd() {
    if (false) // TODO if herd already destroyed
      return "bibin-job/init/about-herd-destroyed";
    return "bibin-job/init/about-herd";
  }

  investigateBibinCanNegociate() {
    return game.player.statistics.barter >= 80;
  }

  investigateBibinNegociated() {
    game.player.statistics.addExperience(125);
    tins.investigateBibinQuest.script.onNegociatedPayment();
  }

  get investigateBibinReward() {
    return this.investigateBibin?.script?.reward || 1000;
  }

  playerLearnsAboutHerdTatoo() {
    game.setVariable("playerKnowsAboutHerdTatoos", 1);
  }

  get knowsAboutGoldenHerdAndBibin() {
    return learnedAboutSavageConnection() || enforcersKnowAboutHerdScouts();
  }

  get saboteurQuestCanStartOrReport() {
    return !this.saboteurQuest || !this.saboteurQuest.script.sentByMatriarch || !this.saboteurQuest.script.reportedToMatriarch;
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

export function create(dialog) {
  return new Dialog(dialog);
}
