import {CharacterBehaviour} from "../character.mjs";

function isCharacterInPonyPen(character) {
  return character.isInZone(level.getTileZone("pony-pen"))
}

export class PackMember extends CharacterBehaviour {
  constructor(model) {
    super(model);
    this.xpBaseValue = 40;
  }
  
  onObservationTriggered() {
    this.watchForIntruders();
  }

  watchForIntruders() {
    if (level.getVariable("player-in-pen") === true) {
      const sendToPen = this.model.fieldOfView.isDetected(game.player)
                     && !isCharacterInPonyPen(game.player)
                     && this.model.hasLineOfSight(game.player);
      if (sendToPen)
        this.startDialog("junkville/dog-jail");
    }
  }

  playReactionSound(reaction) {
    game.sounds.play(this.model, `critters/dog/${reaction}-1`)
  }

  onDied() {
    console.log("PackMember onDied");
    level.script.onDogDied(this.model);
    super.onDied();
  }
}
