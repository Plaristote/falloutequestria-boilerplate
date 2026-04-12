import {CharacterBehaviour} from "./../character.mjs";

export default class extends CharacterBehaviour {
  constructor(model) {
    super(model);
  }

  initialize() {
    this.model.statistics.faction = "cristal-den-golden-herd";
    this.model.attacksOnSight = false;
  }
}
