const unarmedFighter = {
  items: [
    {
      itemType: "dash",
      quantity: 2
    },
    {
      itemType: "health-potion",
      quantity: 1
    }
  ]
};

function addDrugs(inventory) {
  if (Math.random() * 100 > 50) {
    inventory.items.push({ itemType: "dash", quantity: 2 });
  }
  if (Math.random() * 100 > 25) {
    inventory.items.push({ itemType: "health-potion", quantity: 1 });
  }
}

function addUnarmedWeapons(inventory) {
  inventory.slots["use-1"] = {
    hasItem: true,
    itemType: "hoof-blades"
  };
  inventory.slots["use-2"] = {
    hasItem: true,
    itemType: "frag-grenade"
  };
}

function addMeleeWeaponsA(inventory) {
  inventory.slots["use-1"] = {
    hasItem: true,
    itemType: "sledgehammer"
  };
  inventory.slots["use-2"] = {
    hasItem: true,
    itemType: "combat-knife"
  };
}

function addMeleeWeaponsB(inventory) {
  inventory.items.push({
    itemType: "energy-cell",
    quantity: Math.ceil(12 + Math.random() * 20)
  });
  inventory.slots["use-1"] = {
    hasItem: true,
    itemType: "ripper"
  };
  inventory.slots["use-2"] = {
    hasItem: true,
    itemType: "combat-knife"
  }
}

export default function(i) {
  const inventory = { items: [], slots: {} };

  if (i == 0)
    addUnarmedWeapons(inventory);
  else {
    if (i % 3 === 1)
      addMeleeWeaponsA(inventory);
    else
      addMeleeWeaponsB(inventory);
  }
  addDrugs(inventory);
  return inventory;
}
