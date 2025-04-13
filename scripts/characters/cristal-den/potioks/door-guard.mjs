import {CharacterBehaviour} from "./../../character.mjs";

class DoorGuard extends CharacterBehaviour {
  constructor(model) {
    super(model);
    this.dialog = "cristal-den/potioks/door-guard";
    this.proximityWarningGiven = false;
  }

  get withProximityWarning() {
    return !this.proximityWarningGiven && level.getVariable("access", 0) === 0;
  }

  onZoneEntered(object) {
    if (object == game.player)
      this.tryToTriggerProximityWarning();
  }

  onCharacterDetected(character) {
    super.onCharacterDetected(character);
    if (character == game.player)
      this.tryToTriggerProximityWarning();
  }

  tryToTriggerProximityWarning() {
    if (this.withProximityWarning
     && this.model.controlZone.isInside(...game.player.positionSplat())
     && this.model.fieldOfView.isDetected(game.player)) {
      level.addTextBubble(this.model, i18n.t("cristal-den.potioks.door-guard.proximity-warning"), 6500, "yellow");
      this.proximityWarningGiven = true;
    }
  }
}

export function create(model) {
  return new DoorGuard(model);
}
