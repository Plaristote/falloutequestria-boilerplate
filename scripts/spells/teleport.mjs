import {spellCast} from "./base.mjs";

export const targetMode = 2;

export const actionPointCost = 2;

export function use(character, x, y) {
  const range = Math.floor(character.statistics.spellcasting / 12);

  if (character.getDistance(x, y) > range) {
    if (character === game.player)
      game.appendToConsole(i18n.t("messages.out-of-range"));
    return false;
  }
  return spellCast(3, character, triggerUse);
}

export function triggerUse(character, x, y) {
  game.appendToConsole(i18n.t("messages.spellcast-success", {
    character: character.displayName,
    spell: i18n.t("spells.teleport")
  }));
  level.setCharacterPosition(character, x, y);
}
