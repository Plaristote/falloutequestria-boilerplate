function evaluateWeapon(user, weapon) {
  const damage = weapon.script.getDamageRange();
  const average = (damage[0] + damage[1]) / 2;
  return average * user.statistics[weapon.script.skill] / 100;
}

function evaluateSidearm(user, weapon) {
  return weapon.script.getActionPointCost() < 5
    ? evaluateWeapon(user, weapon)
    : 0;
}

function weaponHasEnoughAmmo(item) {
  return item.maxAmmo === 0 || item.ammo > 0 || item.script?.availableAmmo > 0;
}

function weaponNeedsReload(weapon) {
  return weapon && weapon.ammo == 0 && weapon.maxAmmo > 0;
}

export default class {
  constructor(model) {
    this.model = model;
    this.evaluateWeapon = evaluateWeapon;
    this.evaluateSidearm = evaluateSidearm;
  }

  getBestUnequippedWeapon(evaluator) {
    if (!evaluator) evaluator = this.evaluateWeapon;
    const candidates = this.model.inventory.find(item => {
      return item.category === "weapon" && weaponHasEnoughAmmo(item);
    });
    return candidates.sort((itemA, itemB) => {
      return evaluator(itemB, this.model) - evaluator(itemA, this.model);
    })[0];
  }

  getBestUnequippedSidearm() {
    return this.getBestUnequippedWeapon(this.evaluateSidearm);
  }

  getMaxRangeFromEquippedWeapons() {
    const weapon1 = this.model.inventory.getEquippedItem("use-1");
    const weapon2 = this.model.inventory.getEquippedItem("use-2");
    const range1 = weapon1?.script?.getRange ? weapon1.script.getRange() : -1;
    const range2 = weapon2?.script?.getRange ? weapon2.script.getRange() : -2;
    return Math.max(range1, range2);
  }

  canInstantUseWeaponOn(weapon, target) {
    return (!weapon.script.ammoType || weapon.ammo > 0)
         && weapon.getActionPointCost() <= this.model.actionPoints
         && weapon.isInRange(target);
  }

  pickBestUseSlotToUseAgainst(target) {
    const weapon1 = this.model.inventory.getEquippedItem("use-1");
    const weapon2 = this.model.inventory.getEquippedItem("use-2");
    const weapon1Rate = weapon1 ? evaluateWeapon(this.model, weapon1) : 0;
    const weapon2Rate = weapon2 ? evaluateWeapon(this.model, weapon2) : 0;
    const canInstantUse1 = weapon1 && this.canInstantUseWeaponOn(weapon1, target);
    const canInstantUse2 = weapon2 && this.canInstantUseWeaponOn(weapon2, target);

    if (canInstantUse1 && !canInstantUse2)
      return "use-1";
    if (canInstantUse2 && !canInstantUse1)
      return "use-2";
    // If none of the weapons can be used, priority given to the weapon which needs reloading
    if (!canInstantUse1 && !canInstantUse2) {
      if (weaponNeedsReload(weapon1))
        return "use-1";
      else if (weaponNeedsReload(weapon2))
        return "use-2";
    }
    return weapon1Rate >= weapon2Rate ? "use-1" : "use-2";
  }

  equipBestWeapon(item, slotName, evaluator) {
    const currentItem = this.model.inventory.getEquippedItem(slotName);
    if (item && (!currentItem || evaluator(this.model, item) > evaluator(this.model, currentItem)))
    {
      this.model.inventory.unequipItem(slotName);
      this.model.inventory.equipItem(item, slotName);
      this.model.actionPoints -= 2;
    } else if (currentItem && !weaponHasEnoughAmmo(currentItem)) {
      this.model.inventory.unequipItem(slotName);
      if (item)
        this.model.inventory.equipItem(item, slotName);
      this.model.actionPoints -= 2;
    }
  }

  swapWeapons() {
    if (this.model.actionPoints >= 2) {
      const main = this.getBestUnequippedWeapon();
      this.equipBestWeapon(main, "use-1", this.evaluateWeapon);
    }
    if (this.model.actionPoints >= 2) {
      const side = this.getBestUnequippedSidearm();
      this.equipBestWeapon(side, "use-2", this.evaluateSidearm);
    }
  }
}
