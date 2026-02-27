const specialEncounters = [
];

export function onSpecialEncounterOccured(encounter) {
  const occured = JSON.parse(game.getVariable("specEncTriggered", "[]"));
  occured.push(encounter.level);
  game.setVariable("specEncTriggered", JSON.stringify(occured));
}

export function availableSpecialEncounters() {
  const occured = JSON.parse(game.getVariable("specEncTriggered", "[]"));
  return specialEncounters.filter(candidate => occured.indexOf(candidate.level) < 0);
}
