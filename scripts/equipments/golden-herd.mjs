export function generateGear(inventory, difficultyRoll) {
  inventory.slots["saddle"] = {
    "hasItem": true,
    "slotType": "saddle",
    "itemType": "saddle"
  };
  inventory.items.push({
    "itemType": "5.56-ammo",
    "quantity": Math.ceil(difficultyRoll / 2)
  });
  inventory.slots["use-1"] = {
    "hasItem": true,
    "slotType": "any",
    "itemType": "assault-rifle",
    "ammo": 10,
    "quantity": 1,
    "useMode": "use"
  };
  inventory.slots["use-2"] = {
    "hasItem": true,
    "slotType": "any",
    "itemType": "combat-knife",
    "quantity": 1,
    "useMode": "use"
  };
}

export default function (i) {
  const inventory = {
    items: [],
    slots: {
      armor: { hasItem: true, itemType: "metal-armor" }
    }
  };

  generateGear(inventory, 30 + i * 3);
  return inventory;
}
