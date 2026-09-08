export default function inventoryCaravaneer(i = 0) {
  return i % 3 == 0 ? inventoryFighter : inventoryShooter;
}

const inventoryFighter = {
  "items": [
    {
      "animation": "misc",
      "float": false,
      "itemType": "9mm-ammo",
      "objectName": "9mm-ammo",
      "quantity": 24,
      "spriteName": "items",
      "useMode": "",
    }
  ],
  "slots": {
    "armor": {
      "animation": "metal-armor",
      "float": false,
      "hasItem": true,
      "itemType": "metal-armor",
      "mtx": 0,
      "mty": 0,
      "nextX": 0,
      "nextY": 0,
      "objectName": "metal-armor",
      "quantity": 1,
      "rx": 0,
      "ry": 0,
      "slotType": "armor",
      "spriteName": "items",
      "useMode": "use",
      "x": -1,
      "y": -1
    },
    "saddle": {
      "hasItem": false,
      "slotType": "saddle"
    },
    "use-2": {
      "animation": "mouthgun",
      "hasItem": true,
      "itemType": "mouthgun",
      "ammo": 10,
      "objectName": "mouthgun",
      "quantity": 1,
      "slotType": "any",
      "spriteName": "items",
      "useMode": "use"
    },
    "use-1": {
      "hasItem": true,
      "itemType": "combat-knife",
      "objectName": "combat-knife",
      "quantity": 1,
      "slotType": "any",
      "spriteName": "items",
      "useMode": "use"
    }
  }
};

const inventoryShooter = {
  "items": [
    {
      "animation": "misc",
      "blocksPath": false,
      "float": false,
      "itemType": "223-ammo",
      "mtx": 0,
      "mty": 0,
      "nextX": 0,
      "nextY": 0,
      "objectName": "223-ammo",
      "quantity": 30,
      "rx": 0,
      "ry": 0,
      "spriteName": "items",
      "useMode": "",
      "x": -1,
      "y": -1
    }
  ],
  "slots": {
    "armor": {
      "hasItem": false,
      "slotType": "armor"
    },
    "saddle": {
      "hasItem": false,
      "slotType": "saddle"
    },
    "use-1": {
      "animation": "mouthgun",
      "hasItem": true,
      "itemType": "hunting-rifle",
      "ammo": 10,
      "objectName": "hunting-rifle",
      "quantity": 1,
      "slotType": "any",
      "spriteName": "items",
      "useMode": "use"
    },
    "use-2": {
      "hasItem": true,
      "itemType": "combat-knife",
      "objectName": "combat-knife",
      "quantity": 1,
      "slotType": "any",
      "spriteName": "items",
      "useMode": "use"
    }
  }
};
