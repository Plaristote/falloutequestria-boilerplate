import {LevelBase} from "./base.mjs";

export default class extends LevelBase {
  onZoneEntered(zoneName, character) {
    if (character == game.player) {
      switch (zoneName) {
        case "elevator-top-entrance":
        case "elevator-bottom-entrance":
          this.onElevatorEntered();
          break ;
      }
    }
  }

  onElevatorEntered() {
    game.openPrompt(i18n.t("elevator-prompt"), [
      { label: "L", callback: this.useElevator.bind(this, "bottom") },
      { label: "G", callback: this.useElevator.bind(this, "top") },
    ])
  }

  useElevator(zoneLocation) {
    level.insertPartyIntoZone(game.playerParty, `elevator-${zoneLocation}-exit`);
  }
}
