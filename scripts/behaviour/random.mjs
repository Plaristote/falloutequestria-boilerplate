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
  const criticalSuccessThreshold = roller ? roller.statistics.criticalChance : 5;
  const roll = getValueFromRange(0, 100, roller);

  if (roll >= (100 - criticalThreshold) && handlers.criticalFailure)
    return handlers.criticalFailure();
  else if (roll >= threshold && handlers.failure)
    return handlers.failure();
  else if (roll < criticalSuccessThreshold && handlers.criticalSuccess)
    return handlers.criticalSuccess();
  else if (roll < threshold && handlers.success)
    return handlers.success(roll);
  return null;
}

export function randomCheckByOutcomes(handlers, roller = null) {
  const thresholds = Object.keys(handlers.outcomes).map(i => parseInt(i)).sort((a, b) => a - b);
  const successHandlers = handlers.outcomes;
  const failureThreshold = Math.max(...thresholds);

  handlers.success = function(roll) {
    for (let i = 0 ; i < thresholds.length ; ++i) {
      const threshold = thresholds[i];
      if (roll < threshold) {
        return successHandlers[threshold]();
      }
    }
  };
  return randomCheck(failureThreshold, handlers, roller);
}
