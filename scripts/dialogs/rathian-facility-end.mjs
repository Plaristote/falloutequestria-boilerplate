class Dialog {
  constructor(dialog) {
    this.dialog = dialog;
  }

  canIdentifyBlueprints() {
    return game.player.statistics.science >= 80;
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
