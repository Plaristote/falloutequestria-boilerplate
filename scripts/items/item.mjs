import {areInContact} from "../behaviour/pathfinding.mjs";

export class ItemBehaviour {
  constructor(model) {
    this.model = model;
    if (this.requiresTarget == undefined)
      this.requiresTarget = true;
    if (this.useModes == undefined)
      this.useModes = [];
    if (this.zoneTarget == undefined)
      this.zoneTarget = false;
  }

  get user() {
    return this.model.getOwner();
  }

  get trName() {
    return i18n.t(`items.${this.model.itemType}`);
  }

  onLook() {
    game.appendToConsole(i18n.t("inspection.item", {item: i18n.t("items." + this.model.itemType)}));
    return true;
  }

  onLoadedAsEquipped(character) {
  }

  onEquipped(character, on) {
    this.onLoadedAsEquipped(character);
  }

  onConsumed() {
    if (this.user.inventory.isEquippedItem(this.model)) {
      const stock = this.user.inventory.findOne(candidate => {
        return this.model.isGroupable(candidate);
      });

      if (this.model.quantity > 1)
        this.model.remove(1);
      else if (stock && stock.quantity > 1)
        stock.remove(1);
      else if (stock)
        this.user.inventory.removeItem(stock);
      else
        this.user.inventory.removeItem(this.model);
    }
    else {
      this.model.remove(1) || this.user.inventory.removeItem(this.model);
    }
  }

  getActionPointCost() {
    return 2;
  }

  isValidTarget(object) {
    return true;
  }

  getUseAnimation() {
    return [{ type: "Animation", animation: "use", object: this.user }];
  }

  getAnimationSteps(target) {
    return this.getUseAnimation(target);
  }

  attemptToUseActionPointsOn(target) {
    if (this.user.useActionPoints(this.getActionPointCost()))
      return this.triggerUseOn(target);
    else
      this.logFailure(i18n.t("messages.not-enough-ap"));
    return false;
  }

  attemptToUseOn(target) {
    console.log("attemptToUseOn", target);
    if (this.disableCombatUse && game.level && game.level.combat) {
      this.logFailure(i18n.t("messages.cannot-use-in-combat"));
      return false;
    }
    if (!target && !this.requiresTarget)
      return this.attemptToUseActionPointsOn(target);
    else if (target && this.isValidTarget(target)) {
      if (!this.user.hasLineOfSight(target))
        this.logFailure(i18n.t("messages.no-line-of-sight"));
      else if (!this.model.isInRange(target))
        this.logFailure(i18n.t("messages.out-of-range"));
      else
        return this.attemptToUseActionPointsOn(target);
    }
    else
      this.logFailure(i18n.t("messages.invalid-target"));
    return false;
  }

  triggerUseOn(target) {
    return {
      steps:    this.getAnimationSteps(target),
      callback: this.useOn.bind(this, target)
    };
  }

  useOn(target) {
    switch (target.getObjectType()) {
    case "Doorway":
      target.script.onUseItem(this.user, this.model);
      break ;
    default:
      this.logFailure(i18n.t("messages.nothing-happens"));
      break ;
    }
  }

  logFailure(message) {
    if (this.user == level.player)
      game.appendToConsole(message);
    else
      console.log(this.user, `> using item ${this.model.itemType} >`,  message);
  }

  evaluateValue(buyer, seller) {
    const skill = seller.statistics.barter;
    const contestantSkill = buyer.statistics.barter;
    const diff = skill - contestantSkill;
    const base = this.model.value;
    const complement = (this.model.value * 0.4) * (diff / 100);
    return Math.floor(base + Math.max(-base / 2, complement));
  }
}

export const Item = ItemBehaviour;

export function create(model) {
  return new Item(model);
}
