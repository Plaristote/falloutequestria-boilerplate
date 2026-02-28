export default class {
  onElevatorEntered() {
    game.openPrompt(i18n.t("elevator-prompt"), [
      { label: "0", callback: this.useElevator.bind(this, 0) },
      { label: "1", callback: this.useElevator.bind(this, 1) },
      { label: "2", callback: this.useElevator.bind(this, 2) }
    ]);
  }

  useElevator(floorNumber) {
    if (level.name == "unhaus") {
      if (floorNumber != 0)
        game.switchToLevel("unhaus-hive", `elevator-exit-${floorNumber}`);
      else
        level.insertPartyIntoZone(game.playerParty, "elevator-hive-exit");
    } else {
      if (floorNumber == 0)
        game.switchToLevel("unhaus", "elevator-hive-exit");
      else
        level.insertPartyIntoZone(game.playerParty, `elevator-exit-${floorNumber}`);
    }
  }
}
