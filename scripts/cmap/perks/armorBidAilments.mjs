export function isAvailableFor(characterSheet) {
  return false;
}

export function onToggled(characterSheet, toggled) {
  let removed = game.getVariable("armorBidAilmentsRemoved", 0);

  if (toggled) {
    if (characterSheet.healingRate > 2)
      removed = characterSheet.healingRate - 2;
    else if (characterSheet.healingRate > 1)
      removed = 1;
    game.setVariable("armorBidAilmentsRemoved", removed);
    characterSheet.healingRate -= removed;
  }
  else {
    game.unsetVariable("armorBidAilmentsRemoved");
    characterSheet.healingRate += removed;
  }
}
