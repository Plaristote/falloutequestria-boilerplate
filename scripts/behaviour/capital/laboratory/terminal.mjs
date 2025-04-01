export class Terminal {
  constructor(model) {
    this.model = model;
  }

  updateSprite() {
    const side = this.model.getAnimation().indexOf("left") >= 0 ? "left" : "right";
    let animationName = `wall-terminal-${side}`;

    if (this.alimented && this.sleeping)
      animationName += "-sleep";
    else if (!this.alimented)
      animationName += "-off";
    this.model.setAnimation(animationName)
  }

  getAvailableInteractions() {
    return ["use", "look", "use-skill"];
  }

  get alimented() {
    return level.getVariable("power") == 1;
  }

  get sleeping() {
    return false;
  }

  get terminalId() {
    return this.model.parent.name;
  }

  onUse(user) {
    if (user === game.player) {
      if (this.alimented)
        level.initializeDialog(this.model, "capital/laboratory/terminal", this.dialogEntryState);
      else
        game.appendToConsole(i18n.t("capital.laboratory.terminal-not-alimented"));
    }
    return true;
  }
}
