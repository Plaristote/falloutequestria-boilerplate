import {getValueFromRange} from "../../behaviour/random.mjs";

export function getSpellPower(character) {
  return character.statistics.spellcasting + character.statistics.intelligence;
}

export function getMagicDamage(character, range, powerDivisor = 20) {
  const bonus = Math.floor(getSpellPower(character) / powerDivisor);

  return getValueFromRange(range[0], range[1], character) + bonus;
}

export function dealMagicDamage(caster, target, damage, damageType) {
  if (typeof target.script?.mitigateDamage == "function")
    damage = target.script.mitigateDamage(damage, damageType, caster);
  target.takeDamage(damage, caster);
  return damage;
}

export function getVisibleEnemiesInZone(user, x, y, radius) {
  return user.fieldOfView.getEnemies().filter(enemy => {
    return user.hasLineOfSight(enemy) && enemy.getDistance(x, y) <= radius;
  });
}

export function criticalFailureSelfDamage(character, damage, damageType) {
  const backlash = Math.floor(damage / 2);

  game.appendToConsole(i18n.t("messages.spellcast-critical-failure", {
    character: character.displayName
  }));
  if (backlash > 0)
    dealMagicDamage(character, character, backlash, damageType);
  else
    character.addBuff("magic-exhaustion");
}
