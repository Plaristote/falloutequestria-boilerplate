import Terminal from "../terminal.mjs";

export default class extends Terminal {
  constructor(model) {
    super(model);
    this.model = model;
    this.dialog = "stable103/overmare-terminal";
    this.resolved = false;
  }

  initialize() {
    this.enabled = true;
  }

  get rathianQuest() {
    return game.quests.getQuest("stable-103/rathian");
  }

  get canBeUsed() {
    return this.rathianQuest.hasVariable("knowsAboutSentinel");
  }

  get sprite() {
    return "wall-terminal-right";
  }

  onEnabledChanged() {
    this.model.setAnimation(this.sprite + "-sleep");
  }
}
