import {ShopShelf, refillDelay} from "./shopShelf.mjs";

const skillbookDropRates = {
  "spell-book-medicine":       0.05, // value 190
  "spell-book-outdoorsman":    0.08, // value 125
  "spell-book-repair":         0.03, // value 275
  "spell-book-science":        0.02, // value 500
  "spell-book-smallGuns":      0.03, // value 250
  "spell-book-spellcasting":   0.01  // value 340
};

export class SpellbookShelf extends ShopShelf {
  constructor(model) {
    super(model);
  }

  initialize() {
    const spawned = this.spawnedTypes;
    Object.keys(skillbookDropRates).forEach(itemType => {
      if (this.model.inventory.count(itemType) > 0 && spawned.indexOf(itemType) < 0)
        spawned.push(itemType);
    });
    this.spawnedTypes = spawned;
    this.model.tasks.addTask("onShopRefill", refillDelay, 1);
  }

  onShopRefill() {
    if (this.shopOwner && this.shopOwner.isAlive()) {
      Object.keys(skillbookDropRates).forEach(itemType => {
        if (Math.random() < skillbookDropRates[itemType]) {
          this.model.inventory.addItemOfType(itemType, 1);
        }
      });
      this.model.tasks.addTask("onShopRefill", refillDelay, 1);
    }
  }
}

export function create(model) {
  return new SpellbookShelf(model);
}

