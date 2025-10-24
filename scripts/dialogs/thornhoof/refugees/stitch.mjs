import {skillCheck} from "../../../cmap/helpers/checks.mjs";
import {QuestFlags, requireQuest} from "../../../quests/helpers.mjs";

class Dialog {
  constructor(dialog) {
    this.dialog = dialog;
    this.dialog.npc.setVariable("met", 1);
  }

  getEntryPoint() {
    const fightQuest = requireQuest("thornhoof/refugeesFight", QuestFlags.HiddenQuest);
    if (fightQuest.isObjectiveCompleted("find-refugees")) {
      // TODO re-entry dialogs
    } else {
      fightQuest.completeObjective("find-refugees");
      if (level.name == "thornhoof-industrial-zone")
        return "cave-meeting/entry";
      // TODO this should not be happening
      return "cave-meeting/entry";
    }
  }

  get fightQuest() {
    return game.quests.getQuest("thornhoof/refugeesFight");
  }

  refugeesTakeGuns() {
    const quest = game.quests.addQuest("thornhoof/leafQuest", QuestFlags.HiddenQuest);
    quest.script.stolenWeaponsFound();
    ["feather-stitch", "mass-root", "sun-cleft"].forEach(name => {
      const character = level.findObject(name);
      if (character && !character.unconscious) character.script.pickUpGunFromCellarShelf();
    });
  }

  startFight() {
    this.refugeesTakeGuns();
    level.startCombat(game.player);
  }

  npcStartsFight() {
    this.refugeesTakeGuns();
    level.startCombat(this.dialog.npc);
  }

  hasFightQuest() {
    return this.fightQuest != null;
  }

  caveHideoutLearnedFromShaman() {
    return this.fightQuest.script.learnAboutHideout === "shaman";
  }

  caveMeeting() {
    this.fightQuest.completeObjective("find-refugees");
  }

  caveMeetingSentByShaman() {
    this.sentByShaman == true;
  }

  caveMeetingConvinceAttempt() {
    if (this.sentByShaman || skillCheck(game.player, "speech", { target: 100 }))
      return ;
    return "cave-meeting/explanation-fail";
  }

  caveMeetingGoToCouncilConvince() {
    if (game.dataEngine.getReputation("thornhoof-refugees") > 10
    || skillCheck(game.player, "speech", { target: 100 }))
      return "cave-meeting/go-to-council/trust";
    return "cave-meeting/go-to-council/mistrust";
  }

  caveMeetingGoToCouncilConvinceToSpare() {
    if (game.dataEngine.getReputation("thornhoof-refugees") > 10
    || skillCheck(game.player, "speech", { target: 100 }))
      return "cave-meeting/go-to-council/mistrust-defended-successfully";
    return "cave-meeting/go-to-council/mistrust-defended";
  }

  caveMeetingGoToCouncilCanConvinceToSpare() {
    return game.player.statistics.speech >= 75;
  }

  goToConfrontCouncil() {
    // TODO
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
