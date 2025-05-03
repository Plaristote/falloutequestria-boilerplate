import {SkillTargetComponent} from "./skillTarget.mjs";
import EquipmentEquinoid from "./combat/equipment-equinoid.mjs";
import FightTurnActions from "./combat/actions-fight.mjs";

export class CombatComponent extends SkillTargetComponent {
  constructor(model) {
    super(model);
    this._combatRunCount = 0;
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

  isTargetInRange(target) {
    const weapon1 = this.model.inventory.getEquippedItem("use-1");
    const weapon2 = this.model.inventory.getEquippedItem("use-2");
    return (weapon1 && weapon1.isInRange(target))
        || (weapon2 && weapon2.isInRange(target));
  }

  defaultCombatTargetLookup() {
    const enemies = this.model.fieldOfView.getEnemies();
    let candidates = [];
    let others = [];

    console.log(this.logPrefix, "Detected enemies:", enemies, enemies.length);
    for (let i = 0 ; i < enemies.length ; ++i) {
      if (this.isTargetInRange(enemies[i]))
        candidates.push(enemies[i]);
      else
        others.push(enemies[i]);
    }
    if (candidates.length == 0)
      candidates = others;
    else
      console.log(this.logPrefix, "No enemy in weapon range");
    if (candidates.length > 1)
      return candidates[Math.floor(Math.random() * candidates.length)];
    return candidates[0];
  }

  findCombatTarget() {
    console.log(this.logPrefix, "looking for a combat target");
    let shouldLookForTarget = true;
    try { shouldLookForTarget = !(this.combatTarget && this.combatTarget.isAlive()); } catch (err) {}
    if (shouldLookForTarget) {
      if (typeof this.searchForNextCombatTarget == "function")
        this.combatTarget = this.searchForNextCombatTarget();
      else
        this.combatTarget = this.defaultCombatTargetLookup();
    }
    console.log(this.logPrefix, "found a combat target", this.combatTarget);
    return this.combatTarget != null;
  }

  requireCombatTarget() {
    return this.combatTarget ? this.combatTarget : (() => { this.findCombatTarget(); return this.combatTarget })();
  }

  get logPrefix() {
    return `${this.model.displayName}:${this._combatRunCount}:: `;
  }

  onTurnStart() {
    this._combatRunCount++;
    console.log(this.logPrefix, "on turn start", this.model, this.combatTarget);
    if (this.findCombatTarget()) {
      const result = this.model.morale > 0 ? this.fightCombatTarget() : this.runAwayFromCombatTarget();

      if (result != null)
        return result;
    } else if (typeof this.searchForNextCombatTarget == "function") {
      return this.searchForNextCombatTarget();
    }
    console.log(this.logPrefix, "- pass turn", this.model);
    level.passTurn(this.model);
  }

  fightCombatTarget() {
    const equipment = new EquipmentEquinoid(this.model);
    const turnActions = new FightTurnActions(this);

    equipment.swapWeapons();
    turnActions.slotName = equipment.pickBestUseSlotToUseAgainst(this.combatTarget);
    return turnActions.run();
  }

  runAwayFromCombatTarget() {
    console.log(this.logPrefix, "runAwayFromTarget", this.combatTarget, this.model.actionPoints);
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
    console.log(this.logPrefix, "triggering turn again, action completed");
    if (level.isCharacterTurn(this.model)) this.onTurnStart();
  }
}
