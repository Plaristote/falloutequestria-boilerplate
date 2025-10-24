import {skillContest} from "../../cmap/helpers/checks.mjs";
import {Flags as CrystalsQuestFlags} from "../../quests/thornhoof/refugeesCrystals.mjs";

function tryToStartShadowQuest() {
  const quest = game.quests.getQuest("thornhoof/besiegedWalls");

  return quest && !quest.isObjectiveCompleted("talk-to-leaf");
}

class Dialog {
  constructor(dialog) {
    this.dialog = dialog;
    this.fightQuestReward = 200;
  }

  getEntryPoint() {
    if (!this.crystalsQuest)
      return "crystals-quest/entry";
  }

  hasMoreQuests() {
    return this.crystalsQuest.completed && !this.brawlQuest;
  }

  introduceNextQuest() {
    if (!this.crystalsQuest)
      return "crystals-quest/entry";
    if (!this.brawlQuest)
      return "fight-quest/intro";
  }

  get brawlQuest() {
    return game.quests.getQuest("thornhoof/refugeesFight");
  }

  housingDebateStart() {
    this.housingDebatePreviousState = this.previousState;
  }

  housingDebateEnd() {
    switch (this.housingDebatePreviousState) {
      case "crystals-quest/quest-intro":
        return "crystals-quest/intro/part2";
    }
  }

  canTalkAboutCrystalsQuest() {
    return this.crystalsQuest.inProgress;
  }

  canTalkAboutFightQuest() {
    return this.brawlQuest.inProgress;
  }

  fightingQuestIntroduced() {
    game.quests.addQuest("thornhoof/refugeesFight");
  }

  crystalsQuestIntroduced() {
    game.quests.addQuest("thornhoof/refugeesCrystals");
  }

  crystalsQuestIntroContinue() {
    this.crystalQuestsIntroPart = this.crystalQuestsIntroPart ? this.crystalQuestsIntroPart + 1 : 0;
    switch (this.crystalQuestsIntroStep) {
      case 1: return "crystal-quests/part3";
      case 0: return "crystal-quests/part2";
    }
  }

  crystalsQuestCanNegociateReward() {
    return game.player.statistics.barter >= 70;
  }

  get crystalsQuest() {
    return game.quests.getQuest("thornhoof/refugeesCrystals");
  }

  get crystalsQuestUnitReward() {
    return this.crystalsQuest.script.crystalReward;
  }

  set crystalsQuestUnitReward(value) {
    this.crystalsQuest.script.crystalReward = value;
  }

  get crystalsQuestOwnedCrystals() {
    return game.player.inventory.count("crystal-companion");
  }

  crystalsQuestWasShamanConvinced() {
    return this.crystalsQuest.script.flags.has(CrystalsQuestFlags.ShamanConvinced);
  }

  crystalsQuestWasPlayerConvinced() {
    return this.crystalsQuest.script.flags.has(CrystalsQuestFlags.PlayerConvinced);
  }

  crystalsQuestWasShamanCooperative() {
    return this.crystalsQuest.script.flags.has(CrystalsQuestFlags.ShamanCooperating);
  }

  crystalsQuestHasStolenCrystals() {
    return this.crystalsQuestOwnedCrystals > 0;
  }

  crystalsQuestStolenCrystals() {
    this.crystalsQuest.script.flags.add(CrystalsQuestFlags.CrystalsStolen);
  }

  crystalsQuestCanBeEvasive() {
    return game.player.statistics.speech >= 90;
  }

  crystalsQuestTalkedAboutCrystalMagic() {
    return this.crystalsQuest.script.talkedAboutCrystalMagic;
  }

  crystalQuestsKnowsAboutCrystalMagic() {
    return game.player.statistics.spellcasting >= 85;
  }

  crystalsQuestToldAboutCrystalMagic() {
    this.crystalsQuest.script.flags.add(CrystalQuestFlags.CounselorKnowsAboutCrystalMagic);
  }

  crystalsQuestFinish() {
    this.crystalsQuest.script.retrieveCrystals();
    if (this.crystalsQuestReward > 0)
      game.player.inventory.addItemOfType("bottlecaps", this.crystalsQuestReward);
    this.crystalsQuest.completeObjective("report-leaf");
  }

  get crystalsQuestReward() {
    return this.crystalsQuest.script.fullReward;
  }

  fightQuestCanReportKilled() {
    return !level.script.hiddenRefugees.areAlive;
  }

  fightQuestCanReportHideout() {
    const fugitiveAlive = !this.fightQuestCanReportKilled();
    const knowsHideout =
      this.brawlQuest.isObjectiveCompleted("find-refugees")
   || this.brawlQuest.script.learnAboutHideout;
   return knowsHideout && fugitiveAlive;
  }

  fightQuestCanReportWounded() {
    return this.brawlQuest.isObjectiveCompleted("find-wounded-refugee");
  }

  fightQuestHideoutGrab() {
    if (this.brawlQuest.script.hideoutWeaponsRemoved) {
      this.brawlQuest.script.onHideoutGrabbed();
      return "fight-quest/hideout-grabbed";
    } else {
      this.brawlQuest.script.onHideoutCleared();
      return "fight-quest/hideout-cleared";
    }
  }

  fightQuestTrialMercy2() {
    if (!this.crystalsQuestWasShamanConvinced())
      return "fight-quest/judgement/mercy-2-fail";
    if (!this.brawlQuest.getVariable("refugeesArrested", 0) == 1)
      return "fight-quest/judgement/mercy-2-fail-alt";
    return "fight-quest/judgement/mercy-2-success";
  }

  fightQuestTrialMercyEnd() {
    this.brawlQuest.script.onTrialEnded("mercy");
  }

  fightQuestTrialLaborEnd() {
    this.brawlQuest.script.onTrialEnded("labor");
  }

  fightQuestTrialDeathEnd() {
    this.brawlQuest.script.onTrialEnded("death");
  }

  fightQuestReportDeath() {
    this.brawlQuest.script.onReportDeadRefugees();
  }

  fightQuestCanIncreaseReward() {
    return game.player.statistics.barter > 70;
  }

  fightQuestIncreaseReward() {
    this.fightQuestReward = 350;
  }

  notLastAnswer(answer) {
    return this.dialog.previousAnswer !== answer;
  }

  previousState() {
    return this.dialog.stateReference;
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
