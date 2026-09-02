import {spellCast} from "./base.mjs";

export const targetMode = 0;

export const actionPointCost = 4;

const difficulty = {
  "drunk": 1,
  "poisoned": 2,
  "irradiated": 4
};

function purifiedBuff(character) {
  return character.getBuff("drunk") ||
         character.getBuff("poisoned") ||
         character.getBuff("irradiated");
}

export function use(character) {
  const buff = purifiedBuff(character);

  if (!buff) {
    game.appendToConsole(i18n.t("messages.invalid-target"));
    return false;
  }
  return spellCast(
    difficulty[buff.name],
    character,
    triggerUse
  );
}

export function triggerUse(character) {
  const buff = purifiedBuff(character);

  game.appendToConsole(i18n.t("messages.spellcast-success", {
    character: character.displayName,
    spell: i18n.t("spells.purification")
  }) + ' ' + i18n.t("messages.buff-wear-off", {
    character: character.displayName,
    buff: i18n.t(`cmap.buffs.${buff.name}`)
  }));
  buff.remove();
}
