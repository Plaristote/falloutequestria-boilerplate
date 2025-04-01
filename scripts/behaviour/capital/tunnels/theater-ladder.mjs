export class TheaterLadder {
  constructor(model) {
    this.model = model;
  }

  getAvailableInteractions() {
    return ["use", "look"];
  }

  onUse() {
    game.switchToLevel("capital-theater", "tunnel-entry-zone");
  }
}
