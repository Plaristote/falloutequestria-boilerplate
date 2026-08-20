export const DEFAULT_COMPANION_STRATEGY = "solo";
export const DEFAULT_COMPANION_DISTANCE = "middle";

export const COMPANION_STRATEGIES = {
  "fire-support":     companion => companion.getPlayerLastTarget(),
  "suppressing-fire": companion => companion.getPlayerThreatLeader(),
  "solo":             function() { return null; },
};

export const COMPANION_DISTANCES = {
  close:  2,
  middle: 4,
  far:    8,
};

export function getCompanionStrategy(name) {
  return COMPANION_STRATEGIES[name] || COMPANION_STRATEGIES[DEFAULT_COMPANION_STRATEGY];
}

export function getCompanionDistance(name) {
  return COMPANION_DISTANCES[name] != undefined ? COMPANION_DISTANCES[name] : COMPANION_DISTANCES[DEFAULT_COMPANION_DISTANCE];
}
