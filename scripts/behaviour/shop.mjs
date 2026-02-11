import {callGuards, AlarmLevel} from "../characters/components/alarm.mjs";
import {RoutineComponent} from "./routine.mjs";

const stealReactions = [
  {content: i18n.t("bubbles.steal-warning-1"), duration: 2500, color: "yellow"},
  {content: i18n.t("bubbles.steal-warning-2"), duration: 2500, color: "orange"},
  {content: i18n.t("bubbles.steal-warning-3"), duration: 4000, color: "red"},
  {content: i18n.t("bubbles.steal-warning-4"), duration: 3500, color: "red"}
];

const entryReactions = [
  {content: i18n.t("bubbles.shop-welcome-1"), duration: 2500},
  {content: i18n.t("bubbles.shop-welcome-2"), duration: 2500},
  {content: i18n.t("bubbles.shop-welcome-3"), duration: 2500}
];

const exitReactions = [
  {content: i18n.t("bubbles.shop-goodbye-1"), duration: 2500},
  {content: i18n.t("bubbles.shop-goodbye-2"), duration: 2500}
];

const defaultRoutine = [
  { hour: "8",  minute: "30", callback: "openShopRoutine"  },
  { hour: "19", minute: "30", callback: "closeShopRoutine" }
];

function displayRandomTextBubble(character, options) {
  character.script.displayRandomTextBubble(options);
}

export class Shop {
  constructor(model, routine) {
    this.model = model;
    this.isShop = true;
    this.maxShopliftAttempts = 3;
    this.routineComponent =  new RoutineComponent(this, routine || defaultRoutine);
  }

  get shopDoors() {
    return this.model.find(object => object.type == "Doorway");
  }

  get shopOwner() {
    return this.model.findObject("owner")
        || this.model.parent.findObject("owner")
        || this.model.find(object => object.type == "Character")[0];
  }

  get shopShelfs() {
    const npc = this.shopOwner;
    const npcShelfs = npc?.script?.shopShelfs;
    return npcShelfs ? npcShelfs : this.findAllShelves();
  }

  findAllShelves() {
    return this.model.find(object => object.type == "StorageObject");
  }

  get stealAttemptCount() {
    return this.model.hasVariable("stealAttemptCount")
         ? this.model.getVariable("stealAttemptCount") : 0;
  }
  set stealAttemptCount(value) {
    this.model.setVariable("stealAttemptCount", value);
  }

  get guards() {
    return level.findGroup("guards");
  }
  
  get opened() {
    return this.routineComponent.getCurrentRoutine().callback === "openShopRoutine";
  }

  isShopOwnerConscious() {
    return this.shopOwner.isAlive() && !this.shopOwner.unconscious;
  }

  openShopRoutine() {
    if (this.isShopOwnerConscious())
      this.shopDoors.forEach(door => door.locked = false);
  }

  closeShopRoutine() {
    if (this.isShopOwnerConscious()) {
      this.shopDoors.forEach(door => { door.opened = false; door.locked = true });
      this.chaseCustomers();
    }
  }

  initializeBarterController(barterController) {
    const storages = this.shopShelfs;

    if (storages && storages.length) {
      barterController.removeInventory(this.shopOwner.inventory);
      storages.forEach(function(storage) {
        barterController.addInventory(storage.objectName, storage.inventory);
      });
    }
  }
  
  chaseCustomers() {
    const occupants = this.shopOccupants();
    
    for (var i = 0 ; i < occupants.length ; ++i) {
      if (occupants[i].getObjectType() == "Character" && this.shopOwner.fieldOfView.isDetected(occupants[i])) {
        level.moveCharacterToZone(occupants[i], "");
        if (occupants[i] === level.player)
          level.cameraFocusRequired(level.player);
      }
    }
  }

  shopOccupants() {
    return this.model.getControlZoneOccupants();
  }

  isUnderSurveillance() {
    const shopOwner = this.shopOwner;

    if (shopOwner) {
      const occupants = this.model.getControlZoneOccupants();

      return occupants.indexOf(shopOwner) >= 0
          && shopOwner.isAlive()
          && !shopOwner.unconscious;
    }
    return false;
  }

  canShopOwnerNoticeMovementOf(object) {
    return object !== this.shopOwner
        && object.getObjectType() == "Character"
        && this.isUnderSurveillance()
        && (!object.sneaking || this.shopOwner.fieldOfView.isDetected(object));
  }
  
  onZoneEntered(object) {
    if (!level.combat && this.canShopOwnerNoticeMovementOf(object))
    {
      if (this.opened)
        displayRandomTextBubble(this.shopOwner, entryReactions);
      else
        level.addTextBubble(this.shopOwner, i18n.t("bubbles.shop-closed"), 2000, "orange");
    }
  }

  onZoneExited(object) {
    if (!level.combat && this.canShopOwnerNoticeMovementOf(object) && this.opened)
      displayRandomTextBubble(this.shopOwner, exitReactions);
  }

  onShopliftAttempt(user) {
    if (this.isUnderSurveillance()) {
      var i = this.stealAttemptCount;

      this.stealAttemptCount = i + 1;
      i = Math.min(i, this.maxShopliftAttempts);
      if (i >= this.maxShopliftAttempts && this.guards)
        callGuards(this.guards, user, AlarmLevel.Arrest);
      level.addTextBubble(this.shopOwner, stealReactions[i].content, stealReactions[i].duration, stealReactions[i].color);
      return false;
    }
    return true;
  }

  refillShop() {
    this.shopShelfs.forEach(shelf => {
      if (shelf.script?.onShopRefill)
        shelf.script.onShopRefill();
    });
  }
}

export function create(model) {
  return new Shop(model);
}

