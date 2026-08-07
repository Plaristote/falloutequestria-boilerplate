import {WeaponBehaviour} from "./weapon.mjs";
import {ThrowableBehaviour} from "./throwable.mjs";
import {getValueFromRange} from "../behaviour/random.mjs";
import {Explosion} from "../behaviour/explosion.mjs";
import {attemptPushAway} from "./push.mjs";

export default class Sledgehammer extends WeaponBehaviour {
  constructor(model) {
    super(model);
    this.hitSound = "weapons/sledgehammer";
    this.skill = "meleeWeapons";
    this.zoneSize = 1;
    this.useModes = ["hit", "swing"];

    // Only mix in the parts of ThrowableBehaviour we don't override
    // ourselves, so subclasses (see power-sledgehammer.mjs) can still use
    // super.attemptToUseAt()/super.useAt() normally.
    this.getUseAtSuccessRate = ThrowableBehaviour.prototype.getUseAtSuccessRate.bind(this);
    this.disperseThrow       = ThrowableBehaviour.prototype.disperseThrow.bind(this);
    this.onCriticalFailure   = ThrowableBehaviour.prototype.onCriticalFailure.bind(this);
    this.triggerUseAt        = ThrowableBehaviour.prototype.triggerUseAt.bind(this);
  }

  get zoneTarget() {
    return this.model.useMode == "swing";
  }

  get requiresTarget() {
    return this.model.useMode == "hit";
  }

  get triggersCombat() {
    return true;
  }

  getDamageType() {
    return "blunt";
  }

  getDamageRange() {
    return [10, 20];
  }

  getActionPointCost() {
    return this.model.useMode == "swing" ? 5 : 4;
  }

  getRange() {
    return 2;
  }

  // -- "hit" mode: single target, chance to push --

  useOn(target) {
    const damage = getValueFromRange(...this.getDamageRange(), this.user);
    let   mitigated = damage;

    if (typeof target.script?.mitigateDamage == "function")
      mitigated = target.script.mitigateDamage(damage, this.getDamageType(), this.user);
    game.appendToConsole(i18n.t("messages.weapons.use", {
      user:   this.user.statistics.name,
      item:   this.model.displayName,
      target: target.statistics.name,
      damage: mitigated
    }));
    target.takeDamage(mitigated, this.user);
    this.playHitSound(target, mitigated);
    attemptPushAway(target, mitigated, this.user.position);
    return true;
  }

  // -- "swing" mode: zone damage in front of the wielder, reusing the same
  //    Explosion behaviour grenades use for area damage + knockback --

  attemptToUseAt(x, y) {
    if (!this.user.hasLineOfSight(x, y))
      this.logFailure(i18n.t("messages.no-line-of-sight"));
    else if (!this.user.useActionPoints(this.getActionPointCost()))
      this.logFailure(i18n.t("messages.not-enough-ap"));
    else
      return this.triggerUseAt(x, y);
    return false;
  }

  getThrowAnimationSteps(x, y) {
    return [
      { type: "Sound", sound: this.hitSound, object: this.user },
      { type: "Animation", animation: "melee-swing", object: this.user }
    ];
  }

  useAt(x, y) {
    const damage = getValueFromRange(...this.getDamageRange(), this.user);
    const swing  = new Explosion({ x: x, y: y, z: this.user.floor });

    swing.withDamage(damage)
         .withDamageType(this.getDamageType())
         .withRadius(this.zoneSize)
         .withDamageDealer(this.user)
         .withSound(this.hitSound)
         .trigger();
    return true;
  }
}
