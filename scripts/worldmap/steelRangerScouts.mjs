function generateGear(inventory, difficultyRoll) {
  const gearType = Math.ceil(Math.random() * 2);
  const potionCount = Math.max(0, Math.ceil(Math.random() * 5 - 3));

  inventory.slots["saddle"] = {
    "hasItem": true,
    "slotType": "saddle",
    "itemType": "power-saddle"
  };
  if (potionCount > 0)
    inventory.items.push({ "itemType": "health-potion", "quantity": potionCount });
  inventory.items.push({
    "itemType": "energy-cell",
    "quantity": Math.ceil(difficultyRoll / 2)
  });
  inventory.slots["use-1"] = {
    "hasItem": true,
    "slotType": "any",
    "itemType": "plasma-rifle",
    "ammo": 10,
    "quantity": 1,
    "useMode": "use"
  };
  if (gearType == 1) {
    inventory.items.push({
      "itemType": "40mm-grenade-ammo",
      "quantity": Math.ceil(difficultyRoll / 3)
    });
    inventory.slots["use-2"] = {
      "hasItem": true,
      "slotType": "any",
      "itemType": "grenade-launcher",
      "ammo": 8,
      "quantity": 1,
      "useMode": "use"
    };
  } else if (gearType == 2) {
    inventory.slots["use-2"] = {
      "hasItem": true,
      "slotType": "any",
      "itemType": "combat-knife",
      "quantity": 1,
      "useMode": "use"
    };
  }
}

export default function (difficultyRoll) {
  const count = Math.max(3, Math.ceil(Math.random() * (difficultyRoll / 10)));
  const list = [];

  for (let i = 0 ; i < count ; ++i) {
    const data = {
      "sheet": "steel-rangers/scout",
      "script": "steel-rangers/scout.mjs",
      "inventory": { "slots": {}, "items": [] }
    };

    data["inventory"]["slots"]["armor"] = { hasItem: true, itemType: "power-armor" };
    generateGear(data.inventory, difficultyRoll);
    list.push(data);
  }
  return {
    "name": "Steel Ranger Scouts",
    "avoidRoll": (65 + difficultyRoll / 3),
    "members": list
  };
}
