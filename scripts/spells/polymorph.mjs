import {spellCast} from "./base.mjs";

export const targetMode = 1;

export const actionPointCost = 2;

export function use(character, target) {
  if (character.statistics.race == "changeling")
    return true;
  return spellCast(2, character, {
    success: triggerUse.bind(null, character, target)
  });
}

export function triggerUse(character, target) {
  character.script.polymorphParams = {
    race:      target.statistics.race,
    faceTheme: target.statistics.faceTheme,
    hairTheme: target.statistics.hairTheme,
    faceColor: target.statistics.faceColor,
    eyeColor:  target.statistics.eyeColor,
    hairColor: target.statistics.hairColor
  };
  character.addBuff("polymorphed");
}
