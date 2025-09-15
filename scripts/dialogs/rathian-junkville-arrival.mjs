class Dialog {
  constructor(dialog) {
    this.dialog = dialog;
  }

  getEntryPoint() {
    switch (worldmap.getCurrentCity().name) {
    case "junkville":
      return "arrival";
    case "stable-103":
      this.dialog.npc.setVariable("playerLedToStable", 1);
      game.setVariable("rathian-knows-stable-location", true);
      return "arrival-at-stable";
    default:
      return "arrival-elsewhere";
    }
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
