export const spriteSheet = "timberwolf";

export function getDefaultItem(model, slot) {
  return "melee-bite";
}

export function onToggled(statistics, toggled) {
  let modifier = toggled ? 1 : -1;

  statistics.specialPoints = toggled ? 0 : 5;
  statistics.strength     += modifier;
  statistics.perception   += modifier;
  statistics.endurance    -= (modifier * 2);
  statistics.charisma     -= (modifier * 3);
  statistics.intelligence -= modifier;
  statistics.agility      += (modifier * 2);
}

export function modifyBaseSkill(characterSheet, name, value) {
  if (name == "unarmed")
    return value + 25;
  return value;
}
