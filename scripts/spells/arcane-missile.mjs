import {spellCast} from "./base.mjs";
import {getMagicDamage, criticalFailureSelfDamage} from "./helpers/magic.mjs";
import {damageRange, damageType, dealDamageTo, getBoltAnimationStep} from "./arcane-bolt.mjs";
import {getValueFromRange} from "../behaviour/random.mjs";

const difficulty = 2;
const missileCount = 3;
export const targetMode = 0;
export const actionPointCost = 5;

function pickTargets(character) {
  const visible = character.fieldOfView.getEnemies().filter(enemy => character.hasLineOfSight(enemy));
  const targets = [];

  while (targets.length < missileCount && visible.length > 0) {
    const index = Math.floor(getValueFromRange(0, visible.length - 1));

    targets.push(visible.splice(index, 1)[0]);
  }
  return targets;
}

export function use(character) {
  const targets = pickTargets(character);
  const result = spellCast(difficulty, character, {
    success: triggerUse.bind(null, character, targets),
    criticalFailure: criticalFailure.bind(null, character)
  });

  result.steps.push(...targets.map(target => getBoltAnimationStep(character, target)));
  return result;
}

export function triggerUse(character, targets) {
  if (targets.length === 0) {
    game.appendToConsole(i18n.t("messages.invalid-target"));
    return true;
  }
  targets.forEach(target => dealDamageTo(character, target));
  game.appendToConsole(i18n.t("messages.spellcast-success", {
    character: character.displayName,
    spell: i18n.t("spells.arcane-missiles")
  }));
  return true;
}

export function criticalFailure(character) {
  criticalFailureSelfDamage(character, getMagicDamage(character, damageRange), damageType);
}
