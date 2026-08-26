import {skillCheck} from "../cmap/helpers/checks.mjs";
import {getValueFromRange} from "../behaviour/random.mjs";

function disarm(target, weapon = null) {
  const weapon1 = target.inventory.getEquippedItem("use-1");
  const weapon2 = target.inventory.getEquippedItem("use-2");
  let droppedWeapons = [];
  let maxDrop = 0;

  skillCheck(target, "agility", {
    target: 13, dice: 6,
    failure: function() { maxDrop = 1; },
    criticalFailure: function() { maxDrop = 2; }
  });
  if (weapon1 && (weapon == weapon1 || (!weapon1.isVirtual && weapon1.script.triggersCombat)))
    droppedWeapons.push(weapon1);
  if (weapon2 && (weapon == weapon2 || (!weapon2.isVirtual && weapon2.script.triggersCombat)))
    droppedWeapons.push(weapon2);
  for (let i = 0 ; i < maxDrop && i < droppedWeapons.length ; ++i) {
    weapon = droppedWeapons[i];
    target.inventory.unequipItem(weapon);
    target.inventory.dropItem(weapon);
  }
  return droppedWeapons.length > 0 && maxDrop > 0 ? "disarm" : null;
}

function fallProne(target, opponent) {
  let result = 0;

  skillCheck(target, "endurance", {
    target: 13, dice: 6,
    failure: function() {
      result = 1;
      target.actionPoints -= 2;
      target.fall(0, target.orientation);
    },
    criticalFailure: function() {
      result = 2;
      target.fall(0, target.orientation);
      target.addBuff("ko");
    }
  });
  if (result == 2)
    return "ko";
  return result > 0 ? "fall-prone" : null;
}

function damageSelf(target, weapon) {
  const damage = getValueFromRange(...weapon.script.getDamageRange(), target);
  target.takeDamage(damage, null);
  return { type: "damage-self", damage };
}

function mishap(target, weapon) {
  if (!weapon.script.isRangedWeapon()) {
    return fallProne(target, target);
  } else if (weapon.maxAmmo > 0 && weapon.ammo > 0) {
    let result;
    skillCheck(target, "luck", {
      target: 11, dice: 6,
      failure: function() {
        weapon.ammo = 0;
        result = "lost-ammo";
      },
      criticalFailure: function() {
        target.inventory.unequipItem(weapon, true);
        result = "weapon-destroyed";
      }
    });
    return result;
  }
  return disarm(target, weapon);
}

function criticalDamage(target, weapon) {
  return { type: "critical-damage", damage: getValueFromRange(...weapon.script.getDamageRange(), target) };
}

const failures = {
  "disarm": function(weapon, target) { return disarm(weapon.script.user, weapon); },
  "mishap": function(weapon, target) { return mishap(weapon.script.user, weapon); },
  "damage": function(weapon, target) { return damageSelf(weapon.script.user, weapon); }
};

const successes = {
  "disarm": function(weapon, target) { return disarm(target); },
  "mishap": function(weapon, target) { return fallProne(target, weapon.script.user); },
  "damage": function(weapon, target) { return criticalDamage(weapon.script.user, weapon); }
};

const types = ["disarm", "mishap", "damage"];

function rollType() {
  const value = getValueFromRange(0, types.length - 1);
  return types[value];
}

export function rollCriticalSuccess(target, weapon) {
    const baseType = rollType();
  const callback = successes[baseType];
  let a = typeof callback == "function" ? callback(weapon, target) : null;
  console.log("rolled critical success", baseType, a ? (a.type || a) : "resisted");
  return a;
}

export function rollCriticalFailure(target, weapon) {
  const callback = failures[rollType()];
  return typeof callback == "function" ? callback(weapon, target) : null;
}

export function criticalSuccessMessage(result, user, target) {
  const type = typeof result == "string" ? result : result.type;
  const options = typeof result == "string" ? {} : result;
  options.target = target.displayName;
  options.user = user.displayName;
  return i18n.t(`messages.weapons.criticalSuccess.${type}`, options);
}

export function criticalFailureMessage(result, user, target) {
  const type = typeof result == "string" ? result : result.type;
  const options = typeof result == "string" ? {} : result;
  options.target = target.displayName;
  options.user = user.displayName;
  return i18n.t(`messages.weapons.criticalFailure.${type}`, options);
}
