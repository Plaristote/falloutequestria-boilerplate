import {CharacterBehaviour} from "./character.mjs";

export class Turret extends CharacterBehaviour {
  constructor(model) {
    super(model);
    this.canPush = false;
    if (this.model.isAlive() && !level.combat)
      this.model.tasks.addTask("popDown", 100, 1);
  }

  popDown() {
    this.model.actionQueue.pushAnimation("fall-down", "sleep");
    this.model.actionQueue.start();
  }

  popUp() {
    this.model.actionQueue.pushAnimation("get-up");
    this.model.actionQueue.start();
  }

  isAsleep() {
    return this.model.getAnimation().startsWith("sleep") || this.model.getAnimation().startsWith("fall-down");
  }

  onTurnStart() {
    if (this.isAsleep()) {
      this.popUp(); // Add an animation action and use it here, otherwise it does nothing
      return true;
    }
    super.onTurnStart();
  }

  findCombatTarget() {
    if (!this.combatTarget || !this.combatTarget.isAlive()) {
      const enemies = this.model.fieldOfView.getEnemies();
      const weapon  = this.model.inventory.getEquippedItem("use-1");

      for (var i = 0 ; i < enemies.length ; ++i) {
        if (weapon.isInRange(enemies[i])) {
          this.combatTarget = enemies[i];
          break ;
        }
      }
    }
    return this.combatTarget != null;
  }

  fightCombatTarget() {
    const actions  = this.model.actionQueue;
    const weapon   = this.model.inventory.getEquippedItem("use-1");
    const itemAp   = Math.max(1, actions.getItemUseApCost(this.combatTarget, "use-1"));
    var   ap       = this.model.actionPoints;

    if (weapon.isInRange(this.combatTarget)) {
      actions.reset();
      while (ap >= itemAp) {
        actions.pushItemUse(this.combatTarget, "use-1");
        ap -= itemAp;
      }
      console.log(ap, '/', this.model.actionPoints);
      if (ap != this.model.actionPoints)
        return actions.start();
    }
    return null;
  }

  runAwayFromCombatTarget() {
    return null;
  }
}

export function create(model) {
  return new Turret(model);
}
