import {skillCheck} from "../cmap/helpers/checks.mjs";

export class Generator {
  constructor(model) {
    this.model = model;
    if (typeof this.repairLevel == "undefined")
      this.repairLevel = 1;
  }

  getAvailableInteractions() {
    return ["look", "use-skill"];
  }

  get xpReward() {
    return this.repairLevel * 105;
  }

  get running() {
    return this.model.getVariable("running") || false;
  }

  set running(val) {
    if (this.running !== val) {
      this.model.setVariable("running", val);
      this.onRunningChanged();
    }
  }

  toggleRunning() {
    this.running = !this.running;
  }

  onRunningChanged() {
    const base = this.running ? "running" : "idle";
    const orientation = this.model.getAnimation().split('-')[1];

    this.model.setAnimation(`${base}-${orientation}`);
  }

  onRepaired(user) {
    this.toggleRunning();
    if (!this.model.hasVariable("repaired") && user === level.player) {
      this.model.setVariable("repaired", 1);
      level.player.statistics.addExperience(this.xpReward);
      game.appendToConsole(i18n.t("messages.repair-success", {target: this.model.displayName}));
      game.appendToConsole(i18n.t("messages.xp-gain", {xp: this.xpReward}));
    }
  }

  onRepairFailure(user) {
    if (user === level.player) {
      game.appendToConsole(i18n.t("messages.repair-failure", {target: this.model.displayName}));
    }
  }

  onUseRepair(user) {
    return skillCheck(user, "repair", {
      target: 65 + this.repairLevel * 25,
      success: this.onRepaired.bind(this, user),
      failure: this.onRepairFailure.bind(this, user)
    });
  }
}
