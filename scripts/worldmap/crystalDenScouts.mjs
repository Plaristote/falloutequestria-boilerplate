function generateGear(inventory, difficultyRoll) {
  const capsCount = Math.max(0, Math.ceil(Math.random() * 80 - 50));
  const potionCount = Math.max(0, Math.ceil(Math.random() * 5 - 3));

  inventory.slots["saddle"] = {
    "hasItem": false,
    "slotType": "saddle"
  };
  if (capsCount > 0)
    inventory.items.push({ "itemType": "bottlecaps", "quantity": capsCount });
  if (potionCount > 0)
    inventory.items.push({ "itemType": "health-potion", "quantity": potionCount });
  inventory.items.push({
    "itemType": "9mm-ammo",
    "quantity": 8 + Math.ceil(difficultyRoll / 2)
  });
  inventory.slots["use-1"] = {
    "hasItem": true,
    "slotType": "any",
    "itemType": "mouthgun",
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

export default function (difficultyRoll) {
  const count = Math.min(8, Math.max(3, Math.ceil(Math.random() * (difficultyRoll / 10))));
  const list = [];

  for (let i = 0 ; i < count ; ++i) {
    const data = {
      "sheet": "cristal-den/guard",
      "script": "cristal-den/scout.mjs",
      "inventory": { "slots": {}, "items": [] }
    };

    data["inventory"]["slots"]["armor"] = { hasItem: true, itemType: "combat-armor" };
    generateGear(data.inventory, difficultyRoll);
    list.push(data);
  }
  return {
    "name": "Crystal Den Scouts",
    "avoidRoll": (65 + difficultyRoll / 3),
    "members": list
  };
}

