import {getValueFromRange} from "../../behaviour/random.mjs";

export function junkvilleCombattantTemplate(n, type = "underground-combattant") {
  const capsCount = getValueFromRange(0, 31);
  const ammoCount = getValueFromRange(12, 28);
  let items = [];
  let slots = {};

  items.push({ itemType: "9mm-ammo", quantity: ammoCount });
  if (capsCount > 0)
    items.push({ itemType: "bottlecaps", quantity: capsCount });
  slots["use-1"] = { hasItem: true, itemType: "mouthgun", ammo: 6, maxAmmo: 6 };
  return {
    sheet: "junkville-combattant",
    script: `junkville/${type}.mjs`,
    inventory: {
      items: items,
      slots: slots
    }
  };
}
