export var name = "finesse";

// Should also add 30% damage resistance on targets

export function modifyBaseStatistic(characterSheet, name, value) {
  if (name == "criticalChance")
    return value + 10;
  return value;
}

export function onToggled(characterSheet, toggled) {
  console.log(name, "toggled");
}


export function modifyDamageResistance(resistance, dealer) {
  if (dealer && dealer.statistics.traits.indexOf("finesse"))
    return resistance + 30;
  return resistance;
}
