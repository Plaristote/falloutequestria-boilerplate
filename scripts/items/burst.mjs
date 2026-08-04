import {getValueFromRange, randomCheck} from "../behaviour/random.mjs";

export function isBursting(weapon) {
  return weapon.model.useMode === "burst";
}

export function getBystandersInLine(weapon, target) {
  const from = weapon.user.position;
  const characters = level.getCharactersBetween(from.x, from.y, target.position.x, target.position.y);

  return characters
    .slice(0, -1)
    .filter(character => character !== weapon.user && character.isAlive());
}

export function rollBystanderHits(weapon, bystanders) {
  return bystanders.filter(character => {
    const chance = weapon.getUseSuccessRate(character);

    return randomCheck(chance, {
      success:         () => true,
      failure:         () => false,
      criticalFailure: () => false
    }, weapon.user);
  });
}

export function applyBurstDamage(weapon, character) {
  let damage = getValueFromRange(...weapon.getDamageRange(), weapon.user);

  if (weapon.getDamageType && typeof character.script?.mitigateDamage == "function")
    damage = character.script.mitigateDamage(damage, weapon.getDamageType(), weapon.user);
  game.appendToConsole(i18n.t("messages.weapons.use", {
    user:   weapon.user.statistics.name,
    item:   weapon.model.displayName,
    target: character.statistics.name,
    damage: damage
  }));
  character.takeDamage(damage, weapon.user);
  weapon.playHitSound(character, damage);
}

export function triggerBurstUseOn(weapon, target) {
  const successRate = weapon.getUseSuccessRate(target);
  const bystanders   = getBystandersInLine(weapon, target);

  if (weapon.fireSound)
    game.sounds.play(weapon.fireSound);

  return randomCheck(successRate, {
    success:         () => resolveBurstUseOn(weapon, target, true, bystanders),
    failure:         () => resolveBurstUseOn(weapon, target, false, bystanders),
    criticalFailure: () => resolveBurstUseOn(weapon, target, false, bystanders)
  }, weapon.user);
}

function resolveBurstUseOn(weapon, target, targetHit, bystanders) {
  const hitBystanders = rollBystanderHits(weapon, bystanders);
  const hitCharacters = targetHit ? [...hitBystanders, target] : hitBystanders;

  return {
    steps: weapon.getAnimationSteps(target),
    callback: () => {
      for (const character of hitCharacters)
        applyBurstDamage(weapon, character);
      if (!targetHit) {
        // explicit target dodged - same feedback as a normal weapon miss
        weapon.playMissSound(target);
        target.attackedBy(weapon.user);
      }
      return true;
    }
  };
}
