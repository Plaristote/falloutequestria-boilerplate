import {spellCast, useSuccessTarget} from "./base.mjs";
import {getMagicDamage, dealMagicDamage, criticalFailureSelfDamage} from "./helpers/magic.mjs";

const difficulty = 1;
export const damageRange = [4, 9];
export const damageType = "energy";
export const targetMode = 1;
export const actionPointCost = 3;

export function use(character, target) {
  const result = spellCast(difficulty, character, {
    success: triggerUse.bind(null, character, target),
    criticalFailure: criticalFailure.bind(null, character)
  });

  if (result.success) {
    return {
      steps: [
        { type: "Animation", animation: "use", object: character },
        getBoltAnimationStep(character, target)
      ]
    };
  }
  return { steps: [{ type: "Animation", animation: "damaged", object: character }], callback: function() {} };
}

export function triggerUse(character, target) {
  const damage = dealDamageTo(character, target);

  game.appendToConsole(i18n.t("messages.weapons.use", {
    user:   character.displayName,
    target: target.displayName,
    item:   i18n.t("spells.arcane-bolt"),
    damage
  }));
  return true;
}

export function criticalFailure(character) {
  criticalFailureSelfDamage(character, getMagicDamage(character, damageRange), damageType);
}

export function dealDamageTo(character, target) {
  return dealMagicDamage(character, target, getMagicDamage(character, damageRange), damageType);
}

export function getBoltAnimationStep(character, target) {
  const from = character.spritePosition;
  const to = target.spritePosition;
  const animation = `arcane-ball-${character.orientation}`;

  return {
    type: "Sprite",
    name: "effects",
    animation,
    fromX: from.x, fromY: from.y,
    toX: to.x, toY: to.y,
    speed: 300
  };
}

export function getUseSuccessRate(user, target) {
  return 100 - useSuccessTarget(difficulty, user);
}
