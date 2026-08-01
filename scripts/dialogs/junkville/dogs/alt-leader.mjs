import {requireQuest, QuestFlags} from "../../../quests/helpers.mjs";
import {hasAltLeaderTakenOver} from "../../../quests/junkvilleNegociateWithDogs.mjs";

// Reputation threshold below which Dolly considers the player an enemy of
// the pack once she's taken over, rather than someone she's willing to
// spare out of grudging respect.
const GOOD_STANDING_WITH_DOGS = 50;

class Dialog {
  constructor(dialog) {
    this.dialog = dialog;
    this.dialog.ambiance = "cavern";
    this.dialog.mood = "neutral";
    game.dataEngine.showReputation("diamond-dogs");
  }

  // Once Dolly has taken over, everything else about the original
  // conversation (mediation, hatred toward ponies, duels, etc.) becomes
  // moot - she has one thing to say, and it depends entirely on whether
  // the player has earned enough standing with the pack to be spared.
  getEntryPoint() {
    if (hasAltLeaderTakenOver()) {
      game.quests.getQuest("junkvilleNegociateWithDogs").script.pushEvent("talkedAboutTakeover");
      return game.dataEngine.getReputation("diamond-dogs") >= GOOD_STANDING_WITH_DOGS
        ? "took-over/entry-spared"
        : "took-over/entry-hostile";
    }
    return "entry";
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

