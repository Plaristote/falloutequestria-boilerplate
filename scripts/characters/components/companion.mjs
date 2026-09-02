import {CharacterBehaviour} from "../character.mjs";

export const StalkingDistances = {
  "close":  2,
  "medium": 6,
  "far":    10
};

export class CompanionCharacter extends CharacterBehaviour {
  startCompanionship() {
    game.playerParty.addCharacter(this.model);
  }

  endCompanionship() {
    game.playerParty.removeCharacter(this.model);
  }

  onPartyJoined() {
    this.model.attacksOnSight = false;
    this.playerStalking();
  }

  onPartyLeft() {
    this.model.attacksOnSight = true;
    this.model.tasks.removeTask("playerStalking");
  }

  findCombatTarget() {
    super.findCombatTarget();
    if (!this.combatTarget) {
      for (let i = 0 ; i < game.playerParty.list.length ; ++i) {
        const companion = game.playerParty.list[i];
        const enemies = companion.fieldOfView.getEnemies();

        if (enemies.length) {
          this.combatTarget = enemies[0];
          return true;
        }
      }
    }
    return false;
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
