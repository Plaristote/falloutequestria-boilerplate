const questName = "junkville/cavernBandits";

export function canJunkvilleBanditsPop() {
  const quest = game.quests.getQuest(questName);

  return !(quest && quest.isObjectiveCompleted("remove-bandits"));
}

function canGenerateLocationHint() {
  const quest = game.quests.getQuest(questName);

  return !quest || !quest.script.hasEvent("found-hint");
}

function generateGear(inventory, difficultyRoll) {
  const roll = Math.random() * 100;

  if (roll > 75) {
    inventory.slots["use-1"] = {
      "hasItem": true,
      "slotType": "any",
      "itemTpe": "mouthgun",
      "ammo": 10,
      "quantity": 1,
      "useMode": "use"
    };
  } else if (roll > 50) {
    inventory.slots["use-1"] = {
      "hasItem": true,
      "slotType": "any",
      "itemType": "combat-knife",
      "quantity": 1,
      "useMode": "use"
    };
  } else if (roll > 25) {
    inventory.slots["use-1"] = {
      "hasItem": true,
      "slotType": "any",
      "itemType": "rebar-club",
      "quantity": 1,
      "useMode": "use"
    };
  }
}

export default function junkvilleBanditsParty(difficultyRoll) {
  const count = Math.ceil(Math.random() * (difficultyRoll / 15));
  const list = [];
  let hintAvailable = canGenerateLocationHint();

  for (let i = 0 ; i < count ; ++i) {
    const hintRoll = Math.random() * 100;
    const sheetType = ['A', 'B', 'C'][i % 3];
    const data = {
      "sheet": `bandit-${sheetType}`,
      "script": "character.mjs",
      "inventory": { "slots": {}, "items": [] }
    };

    if (hintAvailable && hintRoll > 75) {
      data.inventory.items.push({
        "itemType": "quest-junkville-bandits-cavern-hint",
        "quantity": 1
      });
      hintAvailable = false;
    }
    generateGear(data.inventory, difficultyRoll);
    list.push(data);
  }
  return {
    "name": "Bandits",
    "avoidRoll": (50 + difficultyRoll / 3),
    "members": list
  };
}
