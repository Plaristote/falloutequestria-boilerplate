import {spellCast} from "./base.mjs";
import {getValueFromRange} from "../behaviour/random.mjs";

export const targetMode = 1;

export const actionPointCost = 4;

export function use(character, target) {
  return spellCast(2, character, {
    criticalSuccess: criticalSuccess.bind(null, character, target),
    criticalFailure: criticalFailure.bind(null, character),
    success: triggerUse.bind(null, character, target),
  });
}

export function triggerUse(character, target, critical) {
  const stats = target.statistics;
  const skill = character.statistics.medicine;
  const maxHeal = stats.maxHitPoints - stats.hitPoints;
  const healed = Math.floor(Math.min(maxHeal, 5 + getValueFromRange(1, skill / 9)));
	
  character.statistics.hitPoints += healed;
  game.appendToConsole(i18n.t("messages.spellcast-success", {
    character: character.displayName,
    spell: i18n.t("spells.heal")
  }) + ' ' + i18n.t("messages.healed", {
    target: stats.name,
    hp: healed
  });
}

export function criticalSuccess(character, target) {
  const healed = target.statistics.maxHitPoints - target.statistics.hitPoints;

  target.statistics.hitPoints += healed;
  game.appendToConsole(i18n.t("messages.spellcast-critical-success", {
    character: character.displayName,
    spell: i18n.t("spells.ead")
  }) + ' ' + i18n.t("messages.healed", {
    target: target.displayName,
    hp: healed
  });
}

export function criticalFailure(character) {
  var damage = character.statistics.maxHitPoints / 3;

  if (damage > character.statistics.hitPoints)
    damage = character.statistics.hitPoints - 1;
  game.appendToConsole(i18n.t("messages.spellcast-critical-failure", {
    character: character.displayName
  }));
  character.takeDamage(damage, null);
}
