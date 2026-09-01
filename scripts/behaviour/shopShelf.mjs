import {OwnedStorage} from "./ownedStorage.mjs";

const refillDelay = 1000*60*60*24*7;
const moneyItems = ["bottlecaps"];

function dropRateFor(item) {
  if (item.itemType.startsWith("skill-book")) return 0.01;
  if (item.itemType.startsWith("spell-book")) return 0.02;
  switch (item.category) {
  case "ammo": return 0.8;
  case "consommables": return 0.5;
  }
  if (moneyItems.indexOf(item.itemType) >= 0)
    return 1;
  return 0.3;
}

function createItemPopDescriptor(inventory) {
  const models = [];
  for (let i = 0 ; i < inventory.items.length ; ++i) {
    const item = inventory.items[i];
    models.push({ itemType: item.itemType, quantity: item.quantity, dropRate: dropRateFor(item) });
  }
  return models;
}

export class ShopShelf extends OwnedStorage {
  constructor(model) {
    super(model);
  }

  initialize() {
    this.itemRefillData = createItemPopDescriptor(this.model.inventory);
    this.model.tasks.addTask("onShopRefill", refillDelay, 1);
  }

  onShopRefill() {
    if (this.shopOwner && this.shopOwner.isAlive()) {
      this.itemRefillData.forEach(item => {
        const currentQuantity = this.model.inventory.count(item.itemType);
        const maxItems = Math.floor(item.quantity * 1.5);
        const maxPop = maxItems - currentQuantity;
        let popQuantity = 0;

        if (moneyItems.indexOf(item.itemType) >= 0) {
          popQuantity = maxItems;
        } else {
          for (let i = 0 ; popQuantity < maxPop && i < item.quantity ; ++i) {
            const dropRate = item.dropRate != null ? item.dropRate : 0.4;
            const roll = Math.random();

            if (roll < dropRate)
              popQuantity++;
          }
        }
        this.model.inventory.addItemOfType(item.itemType, popQuantity);
      });
      this.model.tasks.addTask("onShopRefill", refillDelay, 1);
    }
  }

  get itemRefillData() {
    return JSON.parse(this.model.getVariable("drops", "[]"));
  }

  set itemRefillData(data) {
    this.model.setVariable("drops", JSON.stringify(data));
  }

  get storageOwners() {
    return [ this.shopOwner ];
  }

  get withRestrictedAccess() {
    return this.isUnderSurveillance();
  }

  get shop() {
    let parent = this.model.parent;

    while (parent && (!parent.script || !parent.script.isShop))
      parent = parent.parent;
    return parent;
  }
  
  get shopScript() {
    return this.shop.script;
  }

  get shopOwner() {
    return this.shopScript ? this.shopScript.shopOwner : null;
  }
  
  get shopOwnerScript() {
    return this.shopOwner ? this.shopOwner.getScriptObject() : null;
  }

  isUnderSurveillance() {
    return this.shopScript.isUnderSurveillance();
  }

  onStealFailure(guard, user, critical, item) {
    this.shopScript.onShopliftAttempt(user);
  }
}

export function create(model) {
  return new ShopShelf(model);
}

