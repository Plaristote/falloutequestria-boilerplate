export function onToggled(characterSheet, toggled) {
  if (toggled && characterSheet.perks.indexOf("armorBidAilments") >= 0)
    return ;
  if (toggled) {
    const removed = Math.max(characterSheet.healingRate, 3);
    game.setVariable("armorBidAilmentsRemoved", removed);
    characterSheet.healingRate -= removed;
  }
  else {
    characterSheet.healingRate += game.setVariable("armorBidAilmentsRemoved", 0);
  }
}
