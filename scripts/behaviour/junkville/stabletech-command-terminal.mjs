import Terminal from "../terminal.mjs";

export default class extends Terminal {
  constructor(model) {
    super(model);
    this.dialog = "junkville/stabletech-terminal";
  }

  initialize() {
    if (this.model.path === "generator-room.terminal")
      this.enabled = true;
  }
}
