import {spellCast} from "./base.mjs";

const difficulty = 2;
const buffName = "frost-armor";

export const targetMode = 1;

export const actionPointCost = 3;

export function use(chracter) {
  const buff = character.getBuff(buffName);

  if (buff) {
    game.appendToConsole(i18n.t("messages.invalid-target"));
    return false;
  }
  return spellCast(difficulty, character, triggerUse );
}

export function triggerUse(character) {
  const buff = character.getBuff(buffName);

  if (!buff) {
    character.addBuff(buffName);
    game.appendToConsole(i18n.t("messages.spellcast-success", {
      character: character.displayName,
      spell: i18n.t(`cmap.buffs.${buffName}`)
    }));
  }
}
