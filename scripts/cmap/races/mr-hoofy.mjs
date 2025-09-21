export const spriteSheet = "mrhoofy";

export const itemSlots = {"use-1": "any"};

export function getDefaultItem(model, slot) {
  return "melee-bucking";
}

export function onToggled(statistics, toggled) {
  let modifier = toggled ? 1 : -1;

  statistics.damageResistance += 15 * modifier;
  statistics.meleeDamage += 3 * modifier;
}
