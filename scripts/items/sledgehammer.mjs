import {WeaponBehaviour} from "./weapon.mjs";
import {getValueFromRange} from "../behaviour/random.mjs";
import {BlastWave} from "../behaviour/explosion.mjs";
import {attemptPushAway} from "./push.mjs";

export default class Sledgehammer extends WeaponBehaviour {
  constructor(model) {
    super(model);
    this.hitSound = "weapons/sledgehammer";
    this.skill = "meleeWeapons";
    this.zoneSize = 1;
    this.useModes = ["hit", "swing"];
  }

  get zoneTarget() {
    return this.model.useMode == "swing";
  }

  get requiresTarget() {
    return this.model.useMode == "hit" || this.model.useMode == "swing";
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
    return 0;
  }

  useOn(target) {
    if (super.useOn(target)) {
      attemptPushAway(target, this._lastDamage, this.user.position);
      return true;
    }
  }

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
      { type: "Animation", animation: "melee", object: this.user }
    ];
  }

  getDamageFor(target) {
    const damage = getValueFromRange(...this.getDamageRange(), this.user);

    if (typeof target.script?.mitigateDamage == "function")
      return target.script.mitigateDamage(damage, this.getDamageType(), this.user);
    return damage;
  }

  applySwingOnTarget(target) {
    if (target.getObjectType() == "Character" && target != this.user) {
      const damage = this.getDamageFor(target);
      const successRate = getUseSuccessRateAt(target);

      randomCheck(successRate, {
        success: () => {
          game.appendToConsole(i18n.t("messages.damaged", {
            target: target.statistics.name, damage: damage
          }));
          target.takeDamage(damage, this.user);
          attemptPushAway(target, damage, this.user.position);
        }
        failure: () => {
          game.appendToConsole(i18n.t("messages.weapons.dodge", {
            target: target.displayName,
            user: this.user.displayName
          });
        }
      });
    }
  }

  triggerUseAt(x, y) {
    const successRate = this.getUseAtSuccessRate(x, y);
    let callback = this.useAt.bind(this, x, y);

    randomCheck(successRate, {
      criticalFailure: () => {
        callback = this.criticalFailToUseAt.bind(this, x, y);
      }
    });
    return {
      steps: this.getThrowAnimationSteps(x, y),
      callback: callback
    };
  }

  useAt(x, y) {
    const swing  = new BlastWave({ x: x, y: y, z: this.user.floor });

    swing.triggeredOnObject = this.applySwingOnTarget.bind(this);
    swing.withRadius(this.zoneSize)
         .trigger();
    return true;
  }

  criticalFailToUseAt(x, y) {
    game.appendToConsole(i18n.t("messages.weapons.critical-failure", {
      user: this.user.displayName,
      item: this.model.displayName
    })
    this.user.takeDamage(this.getDamageFor(this.user), null);
  }
}
