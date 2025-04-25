import {DialogHelper} from "../helpers.mjs";
import {multipleSkillContest} from "../../cmap/helpers/checks.mjs";

function arrayCount(array, value) {
  const map = arr.reduce((acc, e) => acc.set(e, (acc.get(e) || 0) + 1), new Map());
  return Array.from(map.values()).length;
}

export default class extends DialogHelper {
  get thornhoofCaravan() {
    return game.quests.getQuest("thornhoof/caravan");
  }

  thornhoofCaravanShouldOvertakeEntryPoint() {
    return this.thornhoofCaravan && this.thornhoofCaravan.isObjectiveCompleted("convince-laurie") && !this.thornhoofCaravan.hasVariable("started");
  }

  thornhoofCaravanCanBringUp() {
    return this.thornhoofCaravan && !this.thornhoofCaravan.isObjectiveCompleted("convince-laurie");
  }

  thornhoofWasValidatedByFargo() {
    return this.thornhoofCaravan.isObjectiveCompleted("convince-narbi-fargo");
  }

  thornhoofCanSkipFargo() {
    return game.player.statistics.speech >= 80;
  }

  thunderhoofCombatChallenge() {
    const result = multipleSkillContest(game.player, this.dialog.npc, [
      "strength", "endurance", "charisma",
      "unarmed", "smallGuns", "energyGuns", "bigGuns", "meleeWeapons"
    ]);
    const success = result >= 0.5;
    if (success)
      game.playerParty.addExperience(75); // TODO addExperience message ?
    return `thornhoof-caravan/combat-success-${success ? "success" : "failed"}`;
  }

  thornhoofCaravanAccepted() {
    this.thornhoofCaravan.completeObjective("convince-laurie");
  }

  thornhoofCaravanGoNow() {
    this.thornhoofCaravan.setVariable("strated", 1);
    game.script.caravan.startCaravan("cristal-den", "thornhoof");
  }
}
