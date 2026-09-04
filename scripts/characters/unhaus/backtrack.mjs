import {CharacterBehaviour} from "./../character.mjs";
import {requireQuest, QuestFlags} from "../../quests/helpers.mjs";

export default class extends CharacterBehaviour {
  constructor(model) {
    super(model);
    this.dialog = "unhaus/backtrack";
  }

  followingPlayerToHive() {
    this.model.isUnique = true;
    game.setVariable("backtrackLoadIntoHive", 1);
    game.switchToLevel("unhaus-hive");
  }

  followPlayer() {
    if (level?.script?.backtrackCaptureScene?.active)
      return ;
    super.followPlayer();
  }

  loadIntoHive() {
    const trapQuest = game.quests.getQuest("unhaus/searching-father");
    game.unsetVariable("backtrackLoadIntoHive");
    game.uniqueCharacterStorage.loadCharacterToCurrentLevel("unhaus/backtrack", 6, 10, 1);
    this.model.isUnique = false;
    this.model.tasks.addTask("followPlayer", 3123, 0);
    if (trapQuest && !trapQuest.completed && !trapQuest.failed)
      level.script.startBacktrackCaptureScene();
    else {
      this.model.setAsEnemy("changeling-hive");
      this.model.setVariable("exploringHive", 1);
    }
  }

  onDied() {
    const quest = requireQuest("unhaus/searching-father", QuestFlags.HiddenQuest);
    if (!quest.completed)
      quest.script.killedDirectly = true;
    super.onDied();
  }

  onFoundDaughter() {
    if (!this.model.hasVariable("foundDaughter")) {
      const quest = requireQuest("unhaus/investigateUnhaus", QuestFlags.HiddenQuest);
      quest.script.pushUniqueEvent("found-backtrack-daughter");
      this.model.setVariable("foundDaughter", 1);
      level.addTextBubble(this.model, i18n.t("dialogs.unhaus/backtrack.bubbles.found-daughter"), 7500, "lightblue");
    }
  }
}
