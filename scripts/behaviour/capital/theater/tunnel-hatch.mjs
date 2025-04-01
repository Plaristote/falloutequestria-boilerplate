export class TunnelHatch {
  constructor(model) {
    this.model = model;
    this.sneak = 300;
  }

  initialize() {
    this.model.toggleSneaking(true);
  }

  getAvailableInteractions() {
    return ["use", "look"];
  }

  onUse() {
    game.switchToLevel("capital-tunnels", "from-theater");
  }

  onDetected() {
    game.appendToConsole(i18n.t("messages.discovered-secret-entrance"));
  }
}
