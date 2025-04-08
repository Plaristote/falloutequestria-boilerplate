import {QuestHelper} from "../helpers.mjs";

const questName = "junkville/findHelpful";

export function helpfulHasDisappeared() {
  if (!game.hasVariable("helpfulDead")) {
    const character = game.getCharacter("helpful-copain");
    return character && character.hasVariable("disappearedAt");
  }
  return true;
}

export function isHelpfulQuestAvailable() {
  return !game.quests.getQuest("junkville/findHelpful") && helpfulHasDisappeared();
}

export function teleportToCaverns() {
  game.quests.getQuest(questName).setVariable("rescue-route", 1);
  game.playerParty.addCharacter(level.findObject("house-copain.copain-dad"));
  game.playerParty.addCharacter(level.findObject("house-copain.copain-mom"));
  game.switchToLevel("junkville-cavern", "well-entry");
}

export function findHelpfulRescueRouteState() {
  if (game.quests.getQuest(questName))
    return game.quests.getQuest(questName).getVariable("rescue-route") || 0;
  return 0;
}

export function finalizeRescueRoute() {
  const mom = game.getCharacter("junkville-copain-mom");
  const dad = game.getCharacter("junkville-copain-dad");
  const son = game.getCharacter("helpful-copain");
  const quest = game.quests.getQuest(questName);

  [mom,dad,son].forEach(character => {
    game.playerParty.removeCharacter(character);
    character.tasks.removeTask("followPlayer");
  });
  level.setCharacterPosition(mom, 7, 10);
  level.setCharacterPosition(dad, 8, 9);
  level.setCharacterPosition(son, 7, 9);
  level.setCharacterPosition(game.player, 10, 12);
  level.addTextBubble(mom, "Kthxbye", 5000, "cyan");
  if (!quest.hasVariable("died")) {
    quest.completeObjective("escape-cavern");
    quest.completeObjective("save-helpful");
  }
}

export function helpfulExitCavernHook() {
  console.log("Current state", findHelpfulRescueRouteState());
  if (findHelpfulRescueRouteState() === 2) {
    game.quests.getQuest(questName).setVariable("rescue-route", 3);
    game.switchToLevel("junkville");
    console.log("switchng to junkville");
    return true;
  }
  return false;
}

export class FindHelpful extends QuestHelper {
  initialize() {
    this.model.location = "junkville";
  }

  get xpReward() {
    if (this.isObjectiveCompleted("save-helpful"))
      return 1800;
    return 1000;
  }

  getObjectives() {
    const objectives = [];

    objectives.push({
      label: this.tr("talk-to-parents"),
      success: this.model.isObjectiveCompleted("talk-to-parents")
    });
    objectives.push({
      label: this.tr("find-helpful"),
      success: this.model.isObjectiveCompleted("find-helpful")
    });
    if (findHelpfulRescueRouteState() > 0) {
      objectives.push({
        label: this.tr("escape-cavern"),
        success: this.model.isObjectiveCompleted("escape-cavern"),
        failure: this.model.hasVariable("died")
      });
    }
    if (this.model.isObjectiveCompleted("find-helpful")) {
      objectives.push({
        label: this.tr("save-helpful"),
        success: this.model.isObjectiveCompleted("save-helpful"),
        failure: this.model.hasVariable("died")
      });
    }
    if (this.model.hasVariable("died")) {
      objectives.push({
        label: this.tr("tell-parents"),
        success: this.model.isObjectiveCompleted("tell-parents")
      });
    }
    return objectives;
  }

  completeObjective(objective) {
    super.completeObjective(objective);
    switch (objective) {
      case "save-helpful":
      case "tell-parents":
        this.model.completed = true;
        break ;
    }
  }

  onCharacterKilled(character) {
    if (character.characterSheet === "helpful-copain") {
      this.model.failed = true;
      this.model.setVariable("died", true);
    }
  }

  onSuccess() {
    super.onSuccess();
    game.getCharacter("helpful-copain").setScript("junkville/helpful-copain.mjs");
    game.dataEngine.addReputation("junkville", 51);
  }
}
