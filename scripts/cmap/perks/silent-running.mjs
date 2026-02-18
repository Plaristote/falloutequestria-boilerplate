export function isAvailableFor(characterSheet) {
  return characterSheet.level >= 6 && characterSheet.sneak >= 50 && characterSheet.perks.indexOf("silent-running") < 0;
}
