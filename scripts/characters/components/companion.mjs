import {CharacterBehaviour} from "../character.mjs";

export const StalkingDistances = {
  "close": 2,
  "medium": 4,
  "far": 6
};

export class CompanionCharacter extends CharacterBehaviour {
  startCompanionship() {
    game.playerParty.addCharacter(this.model);
    this.model.attacksOnSight = false;
    this.model.statistics.faction = "player";
    this.playerStalking();
  }

  endCompanionship() {
    game.playerParty.removeCharacter(this.model);
    this.model.attacksOnSight = true;
    this.model.statistics.faction = this.fallbackFaction || "";
    this.tasks.removeTask("playerStalking");
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
