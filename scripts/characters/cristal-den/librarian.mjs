import CharacterBehaviour from "./../shop-owner.mjs";

export default class extends CharacterBehaviour {
  constructor(model) {
    super(model);
    this.dialog = "cristal-den/librarian";
  }

  get bed() {
    return level.findObject("house#2.bed");
  }
}
