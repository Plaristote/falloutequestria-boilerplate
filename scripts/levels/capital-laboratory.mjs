import {LevelBase} from "./base.mjs";

export class CapitalLaboratory extends LevelBase {
  get terminals() {
    return this.model.find(object => object.objectName.startsWith("terminal"));
  }

  get elevatorEnabled() {
    return this.model.getVariable("power") == 1 || this.model.getVariable("powerRedirected") == 1;
  }

  updateTerminals() {
    this.terminals.forEach(terminal => terminal?.script?.updateSprite());
  }

  setPowerEnabled(value) {
    this.model.setVariable("power", value ? 1 : 0);
    this.model.ambientColor = value ? "#764d9e5b" : "#c00a0e0b";
    this.updateTerminals();
  }

  onBloodPact() {
    this.model.setVariable("bloodPact", 1);
    this.model.setVariable("powerRedirected", 1);
    this.model.ambientColor = "#c0610707";
    this.updateTerminals();
    game.player.addBuff("dark-magic-sickness");
  }

  onZoneEntered(zoneName, character) {
    const elevatorsZones = ["elevator-1", "elevator-2", "elevator-3"];
    if (character == game.player && elevatorsZones.indexOf(zoneName) >= 0) {
      this.onElevatorEntered();
      return true;
    } else if (character == game.player && zoneName == "entrance-elevator") {
      this.onEntranceElevatorEntered();
    }
  }

  isElevatorEnabled() {
    return this.model.getVariable("power") == 1 || this.model.getVariable("powerRedirected") == 1;
  }

  onElevatorEntered() {
    if (!this.elevatorEnabled) return ;
    game.openPrompt(i18n.t("elevator-prompt"), [
      { label: "1", callback: this.useElevator.bind(this, 1) },
      { label: "2", callback: this.useElevator.bind(this, 2) },
      { label: "3", callback: this.useElevator.bind(this, 3) }
    ])
  }

  useElevator(floorNumber) {
    level.insertPartyIntoZone(game.playerParty, `elevator-${floorNumber}-entry`);
  }

  onEntranceElevatorEntered() {
    game.openPrompt(i18n.t("elevator-prompt"), [
      { label: "1", callback: this.useEntranceElevator.bind(this, 1) },
      { label: "L", callback: this.useEntranceElevator.bind(this, 0) }
    ])
  }

  useEntranceElevator(floorNumber) {
    if (floorNumber === 0)
      level.insertPartyIntoZone(game.playerParty, `entrance-elevator-entry`);
    else
      game.switchToLevel("capital-laboratory-entry", "elevator-entry");
  }
}
