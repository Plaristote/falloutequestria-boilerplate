import {skillCheck} from "../../cmap/helpers/checks.mjs";
import {requireQuest, QuestFlags} from "../../quests/helpers.mjs";

class Dialog {
  constructor(dialog) {
    this.dialog = dialog;
  }

  onAcceptedCaravanWork() {
    game.setVariable("fargo-caravan-on", 1);
  }

  canPickCaravanSkill() {
    return !this.hasCaravanJob();
  }

  canPickGunnerSkill() {
    return !this.hasGhoulHunterJob();
  }

  hasCaravanJob() {
    return game.getVariable("fargo-caravan-on", 0) == 1;
  }

  hasGhoulHunterJob() {
    return game.getVariable("fargo-ghoul-hunter-on", 0) == 1;
  }

  hasInvestigateUnhausJob() {
    return !!game.quests.getQuest("unhaus/investigateUnhaus") || !!game.getVariable("toldFargoAboutChangelings");
  }

  hasAnyFargoJob() {
    return this.hasCaravanJob() || this.hasGhoulHunterJob() || this.hasInvestigateUnhausJob();
  }

  hasRemainingSkillJob() {
    return !this.hasCaravanJob() || !this.hasGhoulHunterJob() || this.canAcceptInvestigateUnhaus();
  }

  canAskForFirstJob() {
    return !this.hasAnyFargoJob();
  }

  canAskForMoreWork() {
    return this.hasAnyFargoJob() && this.hasRemainingSkillJob();
  }

  canAskAboutPlace() {
    return !this.hasAnyFargoJob();
  }

  canAskAboutCelestialDevice() {
    return this.hasAnyFargoJob();
  }

  hasNoMoreWorkToOffer() {
    return this.hasAnyFargoJob() && !this.hasRemainingSkillJob();
  }

  onEnterWorkAnswer() {
    game.setVariable("knowsLaurieIsCaravaneer", 1);
    if (this.dialog.previousAnswer === "work-ghoul-hunter-accept")
      return {text: this.dialog.tr("work-answer-too-weak"), mood: "cocky"};
    if (this.hasAnyFargoJob())
      return {text: this.dialog.tr("work-answer-repeat"), mood: "cocky"};
  }

  ghoulHunterLevelTest() {
    const partyLevels = game.playerParty.list.reduce(
      (total, character) => total + character.statistics.level / 2,
      0
    );
    const score = game.player.statistics.level + partyLevels;
    if (score < 10)
      return "work-answer";
  }

  onAcceptedGhoulHunterWork() {
    game.setVariable("fargo-ghoul-hunter-on", 1);
  }

  getChangelingQuest() {
    return requireQuest("changelingQuest", QuestFlags.HiddenQuest);
  }

  hasFoundChangelingHive() {
    const quest = this.getChangelingQuest();
    return !!(quest && quest.isObjectiveCompleted("findLair"));
  }

  canAcceptInvestigateUnhaus() {
    return !game.quests.getQuest("unhaus/investigateUnhaus") && !this.hasFoundChangelingHive();
  }

  hasFoundUnhausSecretButNotToldFargo() {
    return this.hasFoundChangelingHive() && !game.getVariable("toldFargoAboutChangelings");
  }

  acceptInvestigateUnhausQuest() {
    let quest = game.quests.getQuest("unhaus/investigateUnhaus");

    if (!quest)
      quest = game.quests.addQuest("unhaus/investigateUnhaus");
    quest.script.onFargoGaveQuest();
  }

  convinceFargoChangelingsTest() {
    if (!skillCheck(game.player, "speech", {dice: 50, target: 100}))
      return "work-investigator-not-convinced";
  }

  onFargoConvincedChangelingsReal() {
    game.setVariable("toldFargoAboutChangelings", 1);

    const investigateQuest = game.quests.getQuest("unhaus/investigateUnhaus");
    if (investigateQuest && !investigateQuest.completed) {
      investigateQuest.completeObjective("find-hive");
      investigateQuest.completed = true;
    }
    // TODO changeling detection spell quest ?
    //requireQuest("cristal-den/changelingDetectionSpell");
  }

  hasThornhoofCaravanQuest() {
    const quest = game.quests.getQuest("thornhoof/caravan");
    return quest && !quest.isObjectiveCompleted("convince-narbi-fargo");
  }

  thornhoofCaravanCost() {
    return 5000;
  }

  thornhoofCaravanCanPay() {
    return game.player.inventory.count("bottlecaps") >= this.thornhoofCaravanCost;
  }

  thornhoofCaravanIntimidateTest() {
    if (game.player.statistics.strength + game.player.statistics.endurance < 14)
      return "thornhoof-caravan/on-test-fail";
  }

  thornhoofCaravanSurvivalTest() {
    if (!skillCheck(game.player, "survival", {dice: 50, target: 100}))
      return "thornhoof-caravan/on-test-fail";
  }

  thornhoofCaravanConvinceTest() {
    const skill = game.player.statistics.speech > game.player.statistics.barter ? "speech" : "barter";
    if (!skillCheck(game.player, skill, {dice: 50, target: 100}))
      return "thornhoof-caravan/on-test-fail";
  }

  thornhoofCaravanAccepted() {
    const quest = game.quests.getQuest("thornhoof/caravan");
    quest.completeObjective("convince-narbi-fargo");
  }

  thornhoofCaravanAcceptedWithPayment() {
    const quest = game.quests.getQuest("thornhoof/caravan");
    quest.setVariable("paidInAdvance", this.thornhoofCaravanCost);
    this.thornhoofCaravanAccepted();
    game.player.inventory.removeItemOfType("bottlecaps", this.thornhoofCaravanCost);
    this.dialog.npc.inventory.addItemOfType("bottlecaps", this.thornhoofCaravanCost);
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
