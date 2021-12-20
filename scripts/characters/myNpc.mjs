import {CharacterBehaviour} from "./character.mjs";

class Npc extends CharacterBehaviour {
  get fleeingCharacter() {
    return game.player;
  }
  
  getAvailableInteractions() {
    const interactions = super.getAvailableInteractions();
    
    if (!level.combat)
      interactions.unshift("talk-to");
    return interactions;
  }

  onTalkTo() {
    level.addTextBubble(this.model, "Catch me if you can !", 3000, "yellow");
    this.model.setAsEnemy(game.player);
  }

  onTurnStart() {
    console.log("MyNPC: On turn start");
    this.tryToRunAway();
  }
  
  onActionQueueCompleted() {
    if (level.combat)
      this.tryToRunAway();
  }
  
  tryToRunAway() {
    const isThreatened = this.fleeingCharacter && this.model.hasLineOfSight(this.fleeingCharacter);
  
    if (isThreatened) {
      this.model.movementMode = "running";
      this.model.moveAway(this.fleeingCharacter);
      if (this.model.actionQueue.isEmpty())
        level.passTurn(this.model);
    }
    else
      level.passTurn(this.model);
  }
}

export function create(model) {
  return new Npc(model);
}
