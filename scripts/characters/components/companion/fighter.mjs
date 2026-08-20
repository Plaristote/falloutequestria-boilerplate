import {getCompanionStrategy, DEFAULT_COMPANION_STRATEGY,
        getCompanionDistance, DEFAULT_COMPANION_DISTANCE} from "./strategies.mjs";
import {DEFAULT_ATTITUDE} from "../combat/target-attitudes.mjs";
import TargetSelector from "./target-selector.mjs";

function overrideGetter(target, propertyName, getter) {
  Object.defineProperty(target, propertyName, { get: getter, configurable: true });
}

export default class CompanionFighterComponent {
  constructor(script) {
    this.model = script.model;
    this.script = script;
    this._attached = false;
  }

  attach() {
    this.backupTargetSelector = this.script.targetSelector;
    this.backupOnPassTurn = this.script.onPassTurn.bind(this.script);
    this.script.targetSelector = new TargetSelector(this);
    this.script.adjustPositionScore = this.adjustPositionScoreForDistance.bind(this);
    this.script.onPassTurn = this.onPassTurn.bind(this);
  }

  detach() {
    this.script.targetSelector = this.backupTargetSelector;
    this.script.adjustPositionScore = undefined;
    this.script.onPassTurn = this.backupOnPassTurn;
  }

  get desiredDistance() {
    return getCompanionDistance(this.model.getVariable("companionDistance", DEFAULT_COMPANION_DISTANCE));
  }

  get positionDistanceWeight() { return 0.5; }

  adjustPositionScoreForDistance(x, y, baseScore) {
    if (baseScore >= 0) {
      const distance = Math.hypot(level.player.position.x - x, level.player.position.y - y);
      const penalty = Math.abs(distance - this.desiredDistance) * this.positionDistanceWeight;
      return baseScore - penalty;
    }
    return baseScore;
  }

  onPassTurn() {
    if (game.player.getDistance(this.model) >= this.desiredDistance) {
      const actions = this.model.actionQueue;
      actions.reset();
      actions.pushReach(game.player, this.desiredDistance);
      actions.start();
    } else {
      this.backupOnPassTurn();
    }
  }
}
