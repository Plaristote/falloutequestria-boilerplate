export const rathianTemplate = {
  sheet: "rathian",
  script: "rathian/meeting.mjs",
  uniq: true,
  inventory: {
    slots: {
      "use-1": { hasItem: true, itemType: "laser-gun", ammo: 10, maxAmmo: 10 },
      "armor": { hasItem: true, itemType: "scribe-armor" }
    },
    items: [
      { itemType: "energy-cell", quantity: 64 }
    ]
  }
};

export function getRathian() {
  for (let i = 0 ; i < level.objects.length ; ++i) {
    if (level.objects[i].characterSheet === rathianTemplate.sheet)
      return level.objects[i];
  }
  return null;
}
