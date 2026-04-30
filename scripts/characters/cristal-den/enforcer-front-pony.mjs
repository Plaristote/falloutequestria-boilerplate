import CharacterBehaviour from "./guard.mjs";

export default class extends CharacterBehaviour {
  constructor(model) {
    super(model);
    this.dialog = "cristal-den/enforcer-host";
  }
}
