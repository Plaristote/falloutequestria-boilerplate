import {CombatComponent} from "./combat.mjs";

export class SceneActorComponent extends CombatComponent {
  isInActiveScene() {
    return this.sceneManager && this.sceneManager.isActive;
  }

  canTalk() {
    return super.canTalk() && !this.isInActiveScene();
  }

  onTurnStart() {
    super.onTurnStart();
    if (this.isInActiveScene())
      this.sceneManager.onCombatTurn(this.model);
  }

  onDamageTaken(amount, dealer) {
    super.onDamageTaken(amount, dealer);
    if (this.isInActiveScene())
      this.sceneManager.onDamageTaken(this.model, dealer);
  }

  onActionQueueCompleted() {
    if (this.isInActiveScene())
      this.sceneManager.onActionQueueCompleted(this.model);
    super.onActionQueueCompleted();
  }

  onDied() {
    if (this.isInActiveScene())
      this.sceneManager.onDied(this.model);
    //super.onDied();
  }
}
