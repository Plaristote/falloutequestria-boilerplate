import CharacterBehaviour from "./../rat.mjs";

export default class extends CharacterBehaviour {
  constructor(model) {
    super(model);
    this.bodyDecayDuration *= 5;
  }
}
