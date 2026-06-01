export function isAvailableFor(characterSheet) {
  return false;
}

export function onToggled(characterSheet, toggled) {
  game.dataEngine.addReputation("cristal-den", toggled ? 25 : -25);
  if (toggled)
    characterSheet.meleeDamage += 1;
  else
    characterSheet.meleeDamage -= 1;
}
