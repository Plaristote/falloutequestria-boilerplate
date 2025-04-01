export const spriteSheet = "shadow-knight";

export const ageRange = { lifespan: 999 };

export function onToggled(statistics, toggled) {
  if (toggled) {
    statistics.strength  += 2;
    statistics.endurance += 2;
    statistics.agility   += 2;
  } else {
    statistics.strength  -= 2;
    statistics.endurance -= 2;
    statistics.agility   -= 2;
  }
}

export function modifyBaseStatistic(statistics, name, value) {
  if (name == "maxHitPoints")
    return value * 2;
  if (name == "melee")
    return value + 25;
  if (name == "sneak")
    return value + 25;
  return value;
}

export function getDefaultItem(model, slot) {
  return "melee-shadow-blade";
}
