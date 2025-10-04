import Terminal from "./../../terminal.mjs"

export default class extends Terminal {
  constructor(model) {
    super(model);
    this.terminalDifficulty = 3;
    this.hackable = true;
    this.dialog = "thornhoof/laboratory/entrance-terminal";
  }

  initialize() {
    this.enabled = true;
  }

  get canBeUsed() {
    return this.hacked;
  }
}
