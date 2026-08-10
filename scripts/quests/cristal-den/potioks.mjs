export function matriarchDead() {
  return game.hasVariable("potiokMatDead");
}

export function patDead() {
  return game.hasVariable("potiokPatDead");
}

export function craftyDead() {
  return game.hasVariable("potiokCraftyDead");
}

export function bittyDead() {
  return game.hasVariable("potiokBittyDead");
}

export function potiokRuleEnded() {
  return matriarchDead() && patDead() && craftyDead();
}

export function allHeirsDead() {
  return patDead() && craftyDead() && bittyDead();
}
