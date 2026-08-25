import {SkillTargetComponent} from "./skillTarget.mjs";
import EquipmentEquinoid from "./combat/equipment-equinoid.mjs";
import FightTurnActions from "./combat/actions-fight.mjs";
import ThreatTable from "./combat/threat-table.mjs";
import TargetSelector from "./combat/target-selector.mjs";
import {canTrashTalk, TrashTalkComponent} from "./combat/trash-talker.mjs";

import CompanionFighterComponent from "./companion/fighter.mjs";

export class CombatComponent extends SkillTargetComponent {
  constructor(model) {
    super(model);
    this._combatRunCount = 0;
    this.threatTable = new ThreatTable();
    this.targetSelector = new TargetSelector(this);
    this.targetAttitude = undefined;
    if (canTrashTalk(model))
      this.trashTalker = new TrashTalkComponent(this);
  }

  onPartyJoined(party) {
    if (!this.companionFighterComponent && party == game.playerParty) {
      this.companionFighterComponent = new CompanionFighterComponent(this);
      this.companionFighterComponent.attach();
    }
  }
  onPartyLeft(party) {
    if (this.companionFighterComponent && party == game.playerParty) {
      this.companionFighterComponent.detach();
      this.companionFighterComponent = undefined;
    }
  }

  get moraleImmune() { return false; }

  get judgementSource() { return undefined; }

  adjustThreat(candidate, rawThreat) { return rawThreat; }

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
    if (dealer && dealer !== this.model) {
      this.lastAttacker = dealer;
      this.threatTable.register(dealer, amount);
      if (this.trashTalker) this.trashTalker.triggerTaunt("hurt");
    }
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
    return this.targetSelector.isTargetInRange(target);
  }

  findCombatTarget() {
    console.log(this.logPrefix, "looking for a combat target");
    let currentIsValid = false;
    try { currentIsValid = !!(this.combatTarget && this.combatTarget.isAlive()); }
    catch (err) { this.combatTarget = null; }

    if (typeof this.searchForNextCombatTarget == "function" && !currentIsValid) {
      this.combatTarget = this.searchForNextCombatTarget();
    } else if (!currentIsValid) {
      this.combatTarget = this.targetSelector.pickTarget();
    } else {
      this.combatTarget = this.targetSelector.reconsider(this.combatTarget);
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

  onTurnStart(isContinuation = false) {
    if (!isContinuation) {
      this._combatRunCount++;
      this._combatRunAP = this.model.actionPoints;
      console.log(this.logPrefix, "on turn start", this.model, this.combatTarget);
      this.threatTable.decay();
      this.targetSelector.reset();
    } else {
      console.log(this.logPrefix, "on turn reentry", this.model, this.combatTarget);
    }
    if (this.findCombatTarget()) {
      const result = this.model.morale > 0 || this.moraleImmune ? this.fightCombatTarget() : this.runAwayFromCombatTarget();

      if (result != null)
        return result;
    } else if (typeof this.searchForNextCombatTarget == "function") {
      return this.searchForNextCombatTarget();
    }
    this.onPassTurn();
  }

  onPassTurn() {
    console.log(this.logPrefix, "- pass turn", this.model);
    level.passTurn(this.model);
  }

  fightCombatTarget() {
    const equipment = new EquipmentEquinoid(this.model);
    const turnActions = new FightTurnActions(this);
    let result;

    equipment.swapWeapons();
    turnActions.slotName = equipment.pickBestUseSlotToUseAgainst(this.combatTarget);
    result = turnActions.run();
    if (result === "unreachable") {
      this.targetSelector.excludedTargets.add(this.combatTarget);
      this.combatTarget = this.targetSelector.pickTarget();
      return this.hasCombatTarget() ? this.fightCombatTarget() : null;
    }
    if (this.trashTalker && result != null)
      this.trashTalker.triggerTaunt("attacking");
    return result;
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
    if (level.isCharacterTurn(this.model) && this._combatRunAP != this.model.actionPoints) {
      this.onTurnStart(true);
    }
  }
}
