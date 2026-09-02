import {CharacterBehaviour} from "../character.mjs";

export const StalkingDistances = {
  "close":  2,
  "medium": 6,
  "far":    10
};

export class CompanionCharacter extends CharacterBehaviour {
  get party() {
    return game.playerParty;
  }

  startCompanionship() {
    this.party.addCharacter(this.model);
  }

  endCompanionship() {
    this.party.removeCharacter(this.model);
  }

  onPartyJoined() {
    this.model.attacksOnSight = false;
    this.playerStalking();
  }

  onPartyLeft() {
    this.model.attacksOnSight = true;
    this.model.tasks.removeTask("playerStalking");
  }

  lookForCombatTargetInParty() {
    for (let i = 0 ; i < this.party.list.length ; ++i) {
      const companion = this.party.list[i];
      const enemies = companion.fieldOfView.getEnemies();

      if (enemies.length) {
        this.combatTarget = enemies[0];
        return true;
      }
    }
    return false;
  }

  findCombatTarget() {
    if (super.findCombatTarget() !== true)
      return this.lookForCombatTargetInParty();
    return true;
  }

  onDied() {
    super.onDied();
    this.endCompanionship();
  }

  playerStalking() {
    if (this.model.isAlive()) {
      const distanceSetting = this.model.getVariable("stalkingSetting", "medium");

      this.model.tasks.addTask("playerStalking", 3000 + Math.random() * 7000);
      this.followPlayer(StalkingDistances[distanceSetting]);
    }
  }
}
