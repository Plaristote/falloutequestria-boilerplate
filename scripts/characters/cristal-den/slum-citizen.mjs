import {CharacterBehaviour} from "./../character.mjs";
import {RoutineComponent} from "../../behaviour/routine.mjs";

export class SlumCitizen extends CharacterBehaviour {
  constructor(model) {
    super(model);
    this.routineComponent = new RoutineComponent(this, [
      {hour: "15", minute: "15", callback: "goToDrink"},
      {hour: "22", minute: "00", callback: "spectateBoxingMatches"},
      {hour: "02", minute: "01", callback: "goToSleep"}
    ]);
  }

  initialize() {
    this.routineComponent.updateRoutine();
  }

  get bed() {
    return this.model.parent.findObject("bed");
  }

  get gym() {
    return level.findGroup("hostel.gym");
  }

  goToDrink() {
    const actions = this.model.actionQueue;
    const self = this;

    this.model.tasks.removeTask("cheerBoxingMatches");
    actions.reset();
    actions.pushMoveToZone("bibin-bar-patrons");
    actions.pushScript({
      onCancel: function() { self.model.tasks.addUniqueTask("goToDrink", 1500 + Math.random() * 6500, 1) }
    });
    actions.start();
  }

  spectateBoxingMatches() {
    const actions = this.model.actionQueue;
    const self = this;

    actions.reset();
    actions.pushMoveToZone("ring-spectate");
    actions.pushLookAt(14, 22);
    actions.pushScript({
      onTrigger: function() { self.model.tasks.addUniqueTask("cheerBoxingMatches", 6000 + Math.random() * 12000, 0); },
      onCancel: function() { self.model.tasks.addUniqueTask("spectateBoxingMatches", 1500 + Math.random() * 6500, 1); }
    });
    actions.start();
  }

  goToSleep() {
    const actions = this.model.actionQueue;
    const self = this;

    this.model.tasks.removeTask("cheerBoxingMatches");
    actions.reset();
    actions.pushReach(this.bed);
    actions.pushScript({
      onCancel: function() { self.model.tasks.addUniqueTask("goToSleep", 1500 + Math.random() * 6500, 1); }
    })
    actions.start();
  }

  cheerBoxingMatches() {
    if (this.gym.script.combatOngoing && this.model.floor == this.gym.floor)
      level.addTextBubble(this.model, ...(this.gym.script.generateCheer()));
  }
}
