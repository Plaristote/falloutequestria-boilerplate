import {CharacterBehaviour} from "./character.mjs";
import {getRandomCaseInZone} from "../behaviour/pathfinding.mjs";

export const textBubbles = [
  {content: i18n.t("bubbles.passerby-1"), duration: 5000 },
  {content: i18n.t("bubbles.passerby-2"), duration: 5000 },
  {content: i18n.t("bubbles.passerby-3"), duration: 5000 }
];

export class PasserbyBehaviour extends CharacterBehaviour {
  constructor(model, locations, intervals = {min: 10, max: 25}) {
    super(model);
    this.passerbyLocations = locations;
    this.textBubbles = textBubbles;
    this.passerbyMinInterval = intervals.min;
    this.passerbyMaxInterval = intervals.max;
    this.scheduleNextTravel();
  }
  
  isPasserbyBehaviourEnabled() {
    return true;
  }

  goToNextLocation() {
    var travelStarted = false;

    if (!level.combat && this.isPasserbyBehaviourEnabled()) {
      const locationIt = Math.floor(Math.random() * 100) % this.passerbyLocations.length;
      const location = this.passerbyLocations[locationIt];
      var position = {x: 0, y: 0 };
      
      if (typeof location === "string")
        position = getRandomCaseInZone(level.findGroup(location).controlZone);
      else
        position = location;
      if (position.z !== undefined)
        this.model.actionQueue.pushReachNear(position.x, position.y, position.z, 3);
      else
        this.model.actionQueue.pushReachNear(position.x, position.y, 3);
      travelStarted = this.model.actionQueue.start();
    }
    if (!travelStarted)
      this.scheduleNextTravel();
  }
  
  scheduleNextTravel() {
    const interval = this.passerbyMinInterval + Math.ceil(Math.random() * (this.passerbyMaxInterval - this.passerbyMinInterval));

    this.model.tasks.addUniqueTask("goToNextLocation", interval * 1000, 1);
  }

  onActionQueueCompleted() {
    super.onActionQueueCompleted();
    this.scheduleNextTravel();
  }
}
