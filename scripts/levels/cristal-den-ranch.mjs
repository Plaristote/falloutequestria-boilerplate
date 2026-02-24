import {LevelBase} from "./base.mjs";

export const RanchAccess = {
  None: 0,
  Entrance: 1,
  Bunker: 2,
  MatriarchOffice: 3
};

export default class extends LevelBase {
  get ranchAccess() {
    return level.getVariable("access", RanchAccess.None);
  }

  hasAccess(value) {
    return this.ranchAccess >= value;
  }

  grantAccess(value) {
    if (this.ranchAccess < value)
      level.setVariable("access", value);
  }

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
