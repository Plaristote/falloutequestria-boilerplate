import {CharacterBehaviour} from "./../../character.mjs";

class DoorGuard extends CharacterBehaviour {
  constructor(model) {
    super(model);
    this.withProximityWarning = true;
    this.dialog = "cristal-den/potioks/door-guard";
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
      this.withProximityWarning = false;
    }
  }
}

export function create(model) {
  return new DoorGuard(model);
}
