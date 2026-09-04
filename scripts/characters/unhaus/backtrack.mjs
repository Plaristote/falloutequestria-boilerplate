import {CharacterBehaviour} from "./../character.mjs";
import {RoutineComponent, toggleRoutine} from "../../behaviour/routine.mjs";
import {requireQuest, QuestFlags} from "../../quests/helpers.mjs";

export default class extends CharacterBehaviour {
  constructor(model) {
    super(model);
    this.dialog = "unhaus/backtrack";
    this.routine = new RoutineComponent(this, [
      { hour: "7", minute: "10", callback: "goToTavern" },
      { hour: "23", minute: "31", callback: "goToSleep" }
    ]);
    toggleRoutine(this.routine, !this.model.hasVariable("unhaus-hive"));
  }

  goToTavern() {
    this.model.actionQueue.pushMovement(25, 22, 2);
    this.model.actionQueue.start();
  }

  goToSleep() {
    const room = level.findGroup("floor-2.inn.room#1");
    const bed = level.findObject("floor-2.inn.room#1.bed");
    if (room) {
      this.model.actionQueue.pushReach(room.findObject("bed"));
      this.model.actionQueue.pushScript(function() { room.findObject("door").opened = false; });
      this.model.actionQueue.start();
    }
  }

  followingPlayerToHive() {
    this.model.isUnique = true;
    this.model.setVariable("in-hive", 1);
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
