const inventoryGuard = {
  "items": [
     {
       "animation": "misc",
       "float": false,
       "itemType": "9mm-ammo",
        "objectName": "9mm-ammo",
       "quantity": 24,
       "spriteName": "items",
       "useMode": ""
     }
  ],
  "slots": {
    "armor": {
      "animation": "metal-armor",
      "float": false,
      "hasItem": true,
      "itemType": "combat-armor",
      "mtx": 0,
      "mty": 0,
      "nextX": 0,
      "nextY": 0,
      "objectName": "combat-armor",
      "quantity": 1,
      "rx": 0,
      "ry": 0,
      "slotType": "armor",
      "spriteName": "items",
      "useMode": "use",
      "x": -1,
      "y": -1
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
    }
  }
};

export default function () {
  return inventoryGuard;
}
