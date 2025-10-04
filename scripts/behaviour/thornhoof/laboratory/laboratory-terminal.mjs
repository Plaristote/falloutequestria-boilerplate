import Terminal from "../../terminal.mjs";

export default class extends Terminal {
  constructor(model) {
    super(model);
    this.hackable = false;
    this.dialog = "thornhoof/laboratory/laboratory-terminal";
  }

  get enabled() {
    return level.script.powerEnabled;
  }
}
