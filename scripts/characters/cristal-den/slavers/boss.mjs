import {CharacterBehaviour} from "./../../character.mjs";
import {updateDenSlaversDead} from "./denSlaversDead.mjs";

export class Boss extends CharacterBehaviour {
  constructor(model) {
    super(model);
    this.dialog = "cristal-den/slavers/boss";
    this.speakOnDetection = true;
  }

  // Scheduled by the dialog (so that it closes first), see slaversErrand escort.
  startSlaveConvoy() {
    game.script.slaveConvoy.startConvoy();
  }

  onDied() {
    updateDenSlaversDead();
    super.onDied();
  }

  canAutoTalk() {
    return super.canAutoTalk() &&
      level.getTileZone("slaver-leader-office").isInside(game.player.position.x, game.player.position.y, game.player.floor);
  }
}
