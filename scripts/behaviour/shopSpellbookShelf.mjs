import {ShopShelf, refillDelay} from "./shopShelf.mjs";

const spellRefilDelay = refillDelay / 2;

const spellbookDropRates = {
  "spell-book-arcane-bolt":    0.10, // value 150
  "spell-book-purification":   0.10, // value 150
  "spell-book-heal":           0.08, // value 350
  "spell-book-arcane-missile": 0.05, // value 850
  "spell-book-sleep":          0.03, // value 1650
  "spell-book-slow":           0.04, // value 1650
  "spell-book-teleport":       0.01  // value 15000
};

export class SpellbookShelf extends ShopShelf {
  constructor(model) {
    super(model);
  }

  initialize() {
    const spawned = this.spawnedTypes;
    Object.keys(spellbookDropRates).forEach(itemType => {
      if (this.model.inventory.count(itemType) > 0 && spawned.indexOf(itemType) < 0)
        spawned.push(itemType);
    });
    this.spawnedTypes = spawned;
    this.model.tasks.addTask("onShopRefill", spellRefillDelay, 1);
  }

  onShopRefill() {
    if (this.shopOwner && this.shopOwner.isAlive()) {
      const spawned = this.spawnedTypes;

      Object.keys(spellbookDropRates).forEach(itemType => {
        if (spawned.indexOf(itemType) >= 0)
          return;
        if (Math.random() < spellbookDropRates[itemType]) {
          this.model.inventory.addItemOfType(itemType, 1);
          spawned.push(itemType);
        }
      });
      this.spawnedTypes = spawned;
      this.model.tasks.addTask("onShopRefill", spellRefillDelay, 1);
    }
  }

  get spawnedTypes() {
    return JSON.parse(this.model.getVariable("spawnedSpellbooks", "[]"));
  }

  set spawnedTypes(data) {
    this.model.setVariable("spawnedSpellbooks", JSON.stringify(data));
  }
}

export function create(model) {
  return new SpellbookShelf(model);
}
