import {VaultDoor} from "../../vault-door.mjs";

export class ElevatorDoor extends VaultDoor {
  constructor(model) {
    super(model);
    this.model = model;
  }

  canGoThrough(character) {
    return level.script.isElevatorEnabled()
        && super.canGoThrough(character);
  }

  onUse(user) {
    const enabled = level.script.isElevatorEnabled();
    if (user == game.player)
      game.appendToConsole(i18n.t("capital.laboratory.elevator-needs-power"));
    return enabled ? super.onUse(user) : true;
  }
}
