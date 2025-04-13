import {CharacterBehaviour} from "../character.mjs";
import {PatrolComponent, PatrolMode} from "../components/patrol.mjs";

const patrolSpots = {
  "sentinel#1": [{x: 27, y: 5},  {x: 11, y: 11}, {x: 12, y: 35}],
  "sentinel#2": [{x: 28, y: 19}, {x: 18, y: 10}, {x: 38, y: 5}],
  "sentinel#3": [{x: 40, y: 5},  {x: 32, y: 10}, {x: 47, y: 34}]
};

export class StabletechSentinel extends CharacterBehaviour {
  constructor(model) {
    super(model);
    this.patrolComponent             = new PatrolComponent(this);
    this.patrolComponent.patrolSpots = patrolSpots[this.model.objectName];
    this.patrolComponent.mode        = PatrolMode.Linear;
  }

  initialize() {
    this.model.fallUnconscious();
  }
}
