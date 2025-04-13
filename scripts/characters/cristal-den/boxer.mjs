import {CharacterBehaviour} from "../character.mjs";

export class Boxer extends CharacterBehaviour {
  constructor(model) {
    super(model);
  }

  initialize() {
    this.model.tasks.addUniqueTask("updateRoutine", 10000 + Math.random() * 4321, 0);
  }

  get gym() {
    return this.model.parent;
  }

  get isFightingInRing() {
    return this.gym.script.combatOngoing && this.gym.script.ringCharacters.indexOf(this.model) >= 0;
  }

  get trainingAppliance() {
    const it = parseInt(this.model.objectName[6]) - 1;
    return this.gym.script.trainingAppliances[it];
  }

  mitigateDamage(damage, dealer) {
    if (dealer == game.player && this.isFightingInRing) {
      if (this.model.statistics.hitPoints <= damage) {
        this.shouldTriggerPlayerVictory = true;
        return this.model.statistics.hitPoints - 1;
      }
    }
    return damage;
  }

  onDamageTaken(damage, dealer) {
    super.onDamageTaken(damage, dealer);
    if (this.shouldTriggerPlayerVictory) {
      this.shouldTriggerPlayerVictory = false;
      this.model.addBuff("ko");
      this.gym.script.onPlayerWinsCombat();
    }
  }

  onDied() {
    super.onDied();
    if (this.isFightingInRing)
      this.gym.script.onPlayerWinsCombat();
  }

  onPlayerBeaten() {
    this.gym.script.onPlayerLosesCombat(this.model);
  }

  updateRoutine() {
    if (!this.isBusy && !this.isFightingInRing) {
      const actions = this.model.actionQueue;
      const appliance = this.trainingAppliance;

      actions.pushReach(appliance);
      actions.pushLookAt(appliance);
      actions.pushAnimation("melee");
      actions.pushWait(3);
      actions.pushAnimation("melee");
      actions.pushWait(2);
      actions.pushAnimation("melee");
      actions.pushWait(4);
      actions.pushAnimation("melee");
      actions.start();
    }
  }
}
