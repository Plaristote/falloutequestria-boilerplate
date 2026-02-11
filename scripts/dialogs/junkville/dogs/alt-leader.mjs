import {requireQuest, QuestFlags} from "../../../quests/helpers.mjs";

class Dialog {
  constructor(dialog) {
    this.dialog = dialog;
    this.dialog.ambiance = "cavern";
    this.dialog.mood = "neutral";
    game.dataEngine.showReputation("diamond-dogs");
  }

  spokeAgainstLeader() {
    return this.dialog.npc.hasVariable("spokeAgainstLeader");
  }

  toldOpinionAboutPony() {
    requireQuest("junkvilleNegociateWithDogs", QuestFlags.HiddenQuest).setVariable("knowAboutDollyOpinion", 1);
  }

  get convinceFailureCount() {
    return this.dialog.npc.hasVariable("convinceErrors") ?
           this.dialog.npc.getVariable("convinceErrors") : 0;
  }

  set convinceFailureCount(value) {
    this.dialog.npc.setVariable("convinceErrors", value);
  }

  onConvinceError() {
    this.dialog.mood = "angry";
    this.convinceFailureCount++;
    if (this.convinceFailureCount >= 2)
      return "hatred-convince-fail";
    game.dataEngine.addReputation("diamond-dogs", -5);
  }

  onConvinced() {
    this.dialog.mood = "neutral";
    requireQuest("junkvilleNegociateWithDogs").completeObjective("alt-leader-convinced");
    game.player.statistics.addExperience(100);
    game.appendToConsole(i18n.t("messages.xp-gain", {xp: 100}));
    game.dataEngine.addReputation("diamond-dogs", 50);
  }

  gavePlayerName() {
    this.dialog.npc.setVariable("knowsPlayerName", 1);
  }

  startCombat() {
    game.diplomacy.setAsEnemy(true, this.dialog.npc.statistics.faction, "player");
    game.dataEngine.addReputation("diamond-dogs", -200);
  }

  start1on1Combat() {
    this.dialog.npc.statistics.faction = "_duelist";
    this.dialog.npc.setAsEnemy(game.player);
    game.dataEngine.addReputation("diamond-dogs", -100);
  }

  canStartMediation() {
    return game.player.statistics.speech > 50;
  }

  canDoMediationLvl1() {
    return game.player.statistics.speech > 67;
  }

  canDoMediationLvl2() {
    return game.player.statistics.speech > 78;
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
