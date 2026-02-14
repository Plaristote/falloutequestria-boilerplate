export class Stable103AccessComputer {
  constructor(model) {
    console.log("stable 103 access computer script created");
    this.model = model;
    if (this.isEnabled())
      this.model.setAnimation("monitor-right-on");
    else
      this.model.setAnimation("monitor-right-off");
    this.model.tasks.addUniqueTask("initializeDoor", 1, 1);
  }

  initializeDoor() {
    this.toggleDoor(false);
  }

  getAvailableInteractions() {
    return ["use", "look"];
  }

  onUse() {
    if (this.isEnabled())
      this.toggleDoor(true);
    else
      game.appendToConsole(i18n.t("inspection.stable-103.terminal-disabled"));
    return true;
  }

  stableDoor() {
    return level.findObject("stable-door");
  }

  toggleDoor(state) {
    const door = this.stableDoor();
    door.setAnimation(state ? "open" : "close");
    door.zoneBlocked = !state;
  }

  isOpened() {
    return !this.stableDoor().zoneBlocked;
  }

  isEnabled() {
    return this.model.hasVariable("enabled") ? this.model.getVariable("enabled") : false;
  }
}
