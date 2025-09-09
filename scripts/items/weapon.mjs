import {ItemBehaviour} from "./item.mjs";
import {getValueFromRange, randomCheck} from "../behaviour/random.mjs";
import {areInContact} from "../behaviour/pathfinding.mjs";

export class WeaponBehaviour extends ItemBehaviour {
  constructor(model) {
    super(model);
    if (this.triggersCombat == undefined)
      this.triggersCombat = true;
    if (this.skill == undefined)
      this.skill = "unarmed";
    if (this.hitSound == undefined)
      this.hitSound = "hoof2hoof/punch";
  }

  isValidTarget(object) {
    return object.getObjectType() === "Character" && object !== this.user && object.isAlive();
  }

  isRangedWeapon() {
    return this.skill != "unarmed" && this.skill != "meleeWeapons";
  }

  isInRange(target) {
    if (this.isRangedWeapon())
      return null; // uses the engine default isInRange
    return areInContact(this.user.position, target.position);
  }

  getUserSkillValue() {
    return this.user.statistics[this.skill];
  }

  getUserPerception() {
   return this.user.statistics.perception;
  }

  getTargetArmorClass(target) {
    return target.statistics.armorClass;
  }

  getRange() {
    return 1.6;
  }

  triggerUseOn(target) {
    const successRate = this.getUseSuccessRate(target);

    if (this.fireSound)
      game.sounds.play(this.fireSound);
    return randomCheck(successRate, {
      failure:         this.triggerDodgeUse.bind(this, target),
      criticalFailure: this.triggerCriticalFailure.bind(this, target),
      success:         super.triggerUseOn.bind(this, target)
    }, this.user);
  }

  triggerDodgeUse(target) {
    return {
      steps: this.getUseAnimation(target),
      callback: this.onDodged.bind(this, target)
    }
  }

  triggerCriticalFailure(target) {
    return this.triggerDodgeUse(target);
  }

  onDodged(target) {
    target.attackedBy(this.user);
    game.appendToConsole(
      i18n.t("messages.weapons.dodge", {
        user: this.user.displayName,
        target: target.displayName
      })
    );
    this.playMissSound(target);
    return true;
  }

  useOn(target) {
    var damage = getValueFromRange(...this.getDamageRange(), this.user);

    if (this.getDamageType)
      damage = target.script.mitigateDamage(damage, this.getDamageType(), this.user);
    game.appendToConsole(
      i18n.t("messages.weapons.use", {
        user: this.user.statistics.name,
        item: this.model.displayName,
        target: target.statistics.name,
        damage: damage
      })
    );
    target.takeDamage(damage, this.user); // damage already mitigated
    this.playHitSound(target, damage);
    return true;
  }

  playMissSound(target) {
    if (target?.script?.playReactionSound)
      target.script.playReactionSound("dodged");
  }

  playHitSound(target) {
    game.sounds.play(target, this.hitSound);
  }

  getUseSuccessRateAt(target, position) {
    const attackerWeaponSkill = this.getUserSkillValue();
    const defenderArmorClass  = this.getTargetArmorClass(target);
    let   baseToHit           = 10 + attackerWeaponSkill - defenderArmorClass;

    if (this.isRangedWeapon()) {
      const distance          = target.getDistance(position.x, position.y);
      const aggravatingFactor = 12 - this.getUserPerception();
      const vision            = level.getVisionQuality(target.position.x, target.position.y, position.x, position.y);

      baseToHit -= aggravatingFactor * Math.max(0, distance - 1);
      baseToHit *= (vision / 100);
    } else if (target.unconscious) {
      baseToHit = Math.max(100, attackerWeaponSkill) - defenderArmorClass / 2;
    }
    //console.log(attackerWeaponSkill, defenderArmorClass);
    return Math.max(0, Math.min(baseToHit, 95));
  }

  getUseSuccessRate(target) {
    return this.getUseSuccessRateAt(target, this.user.position);
  }

  getUseAtSuccessRate(x, y) {
    const attackerWeaponSkill = this.getUserSkillValue();
    const distance = this.user.getDistance(x, y);
    var baseToHit = attackerWeaponSkill;

    baseToHit -= 25;
    baseToHit += 8 * Math.max(0, this.getUserPerception() - 2);
    baseToHit -= Math.max(0, distance - 1) * 7;
    return Math.max(0, Math.min(baseToHit, 95));
  }
}

export const Weapon = WeaponBehaviour;
