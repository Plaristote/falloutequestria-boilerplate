import {LevelBase} from "./base.mjs";

export class CapitalLaboratoryEntry extends LevelBase {
  onZoneEntered(zoneName, character) {
    if (zoneName == "elevator-zone" && character == game.player){
      this.onElevatorEntered();
      return true;
    }
  }

  onElevatorEntered() {
    game.openPrompt(i18n.t("elevator-prompt"), [
      { label: "1", callback: this.useElevator.bind(this, 1) },
      { label: "L", callback: this.useElevator.bind(this, 0) },
    ])
  }

  useElevator(floorNumber) {
    switch (floorNumber) {
    case 0:
      game.switchToLevel("capital-laboratory");
      break ;
    case 1:
      level.insertPartyIntoZone(game.playerParty, `elevator-entry`);
      break ;
    }
  }
}

