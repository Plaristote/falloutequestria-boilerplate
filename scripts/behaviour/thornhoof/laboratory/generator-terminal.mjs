import Terminal from "../../terminal.mjs";

export default class extends Terminal {
  constructor(model) {
    super(model);
    this.hackable = true;
    this.dialog = "thornhoof/laboratory/generator-terminal";
  }

  get enabled() {
    return level.script.powerEnabled;
  }
}
