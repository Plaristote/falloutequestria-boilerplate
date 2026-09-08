import {generateGear} from "../equipments/golden-herd.mjs";

export default function (difficultyRoll) {
  const count = Math.ceil(Math.random() * (difficultyRoll / 10));
  const list = [];

  for (let i = 0 ; i < count ; ++i) {
    const sheetType = Math.ceil(Math.random() * 5);
    const data = {
      "sheet": `golden-herd/warrior#${sheetType}`,
      "script": "golden-herd/scout.mjs",
      "inventory": { "slots": {}, "items": [] }
    };

    data["inventory"]["slots"]["armor"] = { hasItem: true, itemType: "metal-armor" };
    generateGear(data.inventory, difficultyRoll);
    list.push(data);
  }
  return {
    "name": "Golden Herd Scouts",
    "avoidRoll": (65 + difficultyRoll / 3),
    "members": list
  };
}
