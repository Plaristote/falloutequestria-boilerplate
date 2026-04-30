export function potiokRuleEnded() {
  return false; // TODO
}

export function matriarchDead() {
  return !game.getCharacter("cristal-den/potioks/matriarch").isAlive();
}
