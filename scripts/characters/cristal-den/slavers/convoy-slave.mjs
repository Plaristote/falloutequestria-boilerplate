import {CharacterBehaviour} from "../../character.mjs";

// A slave walking in the convoy to Hillburrow (see behaviour/cristal-den/slaveConvoy.mjs).
// Slaves never fight: they run away from whatever attacks the convoy.
export default class ConvoySlave extends CharacterBehaviour {
  constructor(model) {
    super(model);
    this.xpBaseValue = 0;
  }

  get hasWillToFight() {
    return false;
  }
}
