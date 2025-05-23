export function getValueFromRange(from, to, roller) {
  return from + (roller ? roller.dices : dices).roll(to - from);
}

export function isJinxed(character) {
  return character.statistics.traits.indexOf("jinxed") >= 0;
}

export function randomInterval(min, max) {
  return Math.random() * (max - min) + min;
}

export function randomCheck(threshold, handlers, roller = null) {
  const criticalThreshold = isJinxed(level.player) ? 5 : 15;
  const roll = getValueFromRange(0, 100, roller);

  if (roll >= (100 - criticalThreshold) && handlers.criticalFailure)
    return handlers.criticalFailure();
  else if (roll >= threshold && handlers.failure)
    return handlers.failure();
  else if (handlers.success)
    return handlers.success();
  return null;
}
