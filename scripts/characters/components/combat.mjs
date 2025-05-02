import {SkillTargetComponent} from "./skillTarget.mjs";

function evaluatePathfindingOption(target, x, y) {
  const value = level.getVisionQuality(target.position.x, target.position.y, x, y);
  return value - 1;
}

export class CombatComponent extends SkillTargetComponent {
  constructor(model) {
    super(model);
  }

  onTalkTo() {
    if (this.model.isEnemy(level.player))  {
      if (this.model.morale > 0)
        this.displayRandomTextBubble(this.offensiveTextBubbles);
      this.model.requireJoinCombat();
      return false;
    }
    return super.onTalkTo();
  }

  onDamageTaken(amount, dealer) {
    console.log("on damage taken", amount, dealer);
    this.combatTarget = dealer;
    this.playReactionSound("damaged", 1);
  }

  onFell() {
    this.playReactionSound("fall");
  }

  hasCombatTarget() {
    try {
      return this.combatTarget && this.combatTarget.isAlive();
    } catch (err) {
      return false;
    }
  }

  defaultCombatTargetLookup() {
    const enemies = this.model.fieldOfView.getEnemies();

    console.log("Detected enemies:", enemies, enemies.length, enemies[0]);
    return enemies[0];
  }

  findCombatTarget() {
    console.log(this.model, "looking for a combat target");
    let shouldLookForTarget = true;
    try { shouldLookForTarget = !(this.combatTarget && this.combatTarget.isAlive()); } catch (err) {}
    if (shouldLookForTarget) {
      if (typeof this.searchForNextCombatTarget == "function")
        this.combatTarget = this.searchForNextCombatTarget();
      else
        this.combatTarget = this.defaultCombatTargetLookup();
    }
    console.log(this.model, "found a combat target", this.combatTarget);
    return this.combatTarget != null;
  }

  requireCombatTarget() {
    return this.combatTarget ? this.combatTarget : (() => { this.findCombatTarget(); return this.combatTarget })();
  }

  onTurnStart() {
    console.log("on turn start", this.model, this.combatTarget);
    if (this.findCombatTarget()) {
      const result = this.model.morale > 0 ? this.fightCombatTarget() : this.runAwayFromCombatTarget();

      if (result != null)
        return result;
    } else if (typeof this.searchForNextCombatTarget == "function") {
      return this.searchForNextCombatTarget();
    }
    console.log("- pass turn", this.model);
    level.passTurn(this.model);
  }

  fightCombatTarget() {
    const pathEval = evaluatePathfindingOption.bind(this, this.combatTarget);
    const actions  = this.model.actionQueue;
    const weapon   = this.model.inventory.getEquippedItem("use-1");
    const movement = actions.getReachApCost(this.combatTarget, weapon.getRange(), pathEval);
    let   ap       = this.model.actionPoints;
    let   itemAp;

    weapon.useMode = weapon.defaultUseMode;
    itemAp = Math.max(1, actions.getItemUseApCost(this.combatTarget, "use-1"));
    console.log(this.model.statistics.name, "fightCombatTarget", movement, ap, itemAp, weapon.itemType, weapon.useMode);
    if (movement >= 0) {
      actions.reset();
      if (weapon.maxAmmo > 0 && weapon.ammo === 0) {
        if (weapon.getScriptObject().availableAmmo === 0) {
          this.model.inventory.unequipItem("use-1");
          return this.fightCombatTarget();
        }
        ap -= 2;
        weapon.useMode = "reload";
        actions.pushItemUse(null, "use-1");
        weapon.useMode = weapon.defaultUseMode;
      }
      if (movement > 0) {
        ap -= Math.min(movement, ap);
        actions.pushReach(this.combatTarget, weapon.getRange(), pathEval);
      }
      while (ap >= itemAp) {
        actions.pushItemUse(this.combatTarget, "use-1");
        ap -= itemAp;
      }
      console.log(ap, '/', this.model.actionPoints);
      if (ap != this.model.actionPoints) {
        console.log("Starting action queue");
        return actions.start();
      }
    }
    return null;
  }

  runAwayFromCombatTarget() {
    console.log("runAwayFromTarget", this.combatTarget, this.model.actionPoints);
    if (this.model.actionPoints > 0) {
      this.model.movementMode = "running";
      this.model.moveAway(this.combatTarget);
    }
    if (!this.model.actionQueue.isEmpty())
      return true;
  }

  onActionQueueCompleted() {
    if (level.combat)
       this.onCombatActionQueueCompleted();
  }

  onCombatActionQueueCompleted() {
    console.log("triggering turn again, action completed");
    if (level.isCharacterTurn(this.model)) this.onTurnStart();
  }
}
