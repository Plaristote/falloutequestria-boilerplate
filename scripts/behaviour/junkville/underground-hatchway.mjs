export class UndergroundHatchway {
  constructor(model) {
    this.model = model;
    this.sneak = 140;
    if (game.dataEngine.hasLevelBeenVisited("junkville-underground"))
      this.model.toggleSneaking(false);
  }

  initialize() {
    this.model.toggleSneaking(true);
  }

  getAvailableInteractions() {
    return ["use", "look"];
  }

  onUse() {
    game.switchToLevel("junkville-underground", "entry");
  }

  onDetected() {
    game.appendToConsole(i18n.t("messages.discovered-secret-entrance"));
  }
}
