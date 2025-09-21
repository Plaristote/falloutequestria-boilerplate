import {skillCheck} from "../cmap/helpers/checks.mjs";

export default class {
  constructor(model) {
    this.model = model;
  }

  get xpReward() {
    return (this.terminalDifficulty || 1) * 50;
  }

  get enabled() {
    return this.model.getVariable("enabled", false);
  }

  set enabled(value) {
    this.model.setVariable("enabled", value);
    this.onEnabledChanged();
  }

  get hacked() {
    return this.model.getVariable("hacked", false);
  }

  set hacked(value) {
    this.model.setVariable("hacked", value);
  }

  get sprite() {
    return this.model.getAnimation().replace(/-(on|off)$/, '');
  }

  onEnabledChanged() {
    this.model.setAnimation(`${this.sprite}-${this.enabled ? 'on' : 'off'}`);
  }

  getAvailableInteractions() {
    if (this.enabled)
      return ["use", "look", "use-skill"];
    return ["look", "use-skill"];
  }

  onUse(user) {
    if (user === level.player) {
      if (this.canBeUsed || this.canBeUsed === undefined)
        level.initializeDialog(this.model, this.dialog);
      else
        game.appendToConsole(i18n.t("messages.nothing-happens"));
    }
  }

  onUseScience(user) {
    if (this.enabled && this.hackable && !this.hacked) {
      const xpReward = this.xpReward;
      if (this.hackTerminal(user))
        game.appendToConsole(i18n.t("messages.hacked-terminal", {xp: xpReward}));
      else
        game.appendToConsole(i18n.t("messages.hacked-terminal-fail"));
      return true;
    }
    return false;
  }

  hackTerminal(user) {
    let success = false;

    game.asyncAdvanceTime(10);
    skillCheck(user, "science", {
      target: 55 + ((this.terminalDifficulty || 1) * 23),
      success: () => {
        success = true;
        this.onHackingSuccess();
      },
      criticalFailure: this.onHackingCriticalFailure.bind(this)
    });
    return success;
  }

  onHackingSuccess() {
    const difficulty = this.terminalDifficulty || 1;

    level.player.statistics.addExperience(this.xpReward);
    this.hacked = true;
  }

  onHackingCriticalFailure() {
  }
}
