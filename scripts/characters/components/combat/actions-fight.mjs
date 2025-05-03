function evaluatePathfindingOption(target, x, y) {
  const value = level.getVisionQuality(target.position.x, target.position.y, x, y);
  return value - 1;
}

function evaluatePathfindingOptionForWeapon(target, weapon, threshold, x, y) {
  const successRate = weapon.script.getUseSuccessRateAt(target, { x, y });
  return successRate >= threshold ? evaluatePathfindingOption(target, x, y) : -1;
}

export default class {
  constructor(parent) {
    this.parent = parent;
    this.model = parent.model;
    this.target = parent.combatTarget;
    this.slotName = "use-1";
    this.useSuccessRateThreshold = Math.min(55, this.model.statistics.intelligence * 7);
  }

  get logPrefix() { return this.parent.logPrefix; }
  get weapon() { return this.model.inventory.getEquippedItem(this.slotName); }

  run() {
    const actions = this.model.actionQueue;
    const movement = this.findBestPosition(this.weapon);

    actions.reset();
    if (movement.ap >= 0 && this.scheduleActions(movement)) {
      console.log(this.logPrefix, "starting ActionQueue");
      return actions.start();
    }
    return null;
  }

  scheduleActions(movement) {
    const actions = this.model.actionQueue;
    const weapon  = this.weapon;
    let ap = this.model.actionPoints;

    if (ap <= 0)
      return false;
    switch (this.checkWeaponAmmo(ap, actions, weapon)) {
      case "ko":     return false;
      case "reload": ap -= 2;
    }
    ap = this.moveInPosition(ap, actions, movement);
    ap = this.fireAtWill(ap, actions, weapon);
    console.log(this.logPrefix, "scheduleActions done:", ap, '/', this.model.actionPoints);
    return ap != this.model.actionPoints;
  }

  moveInPosition(ap, actions, movement) {
    if (movement.ap > 0) {
      ap -= Math.min(movement.ap, ap);
      actions[movement.pathMethod](this.target, this.weapon.getRange(), movement.pathEval);
    }
    return ap;
  }

  fireAtWill(ap, actions, weapon) {
    const itemAp = Math.max(1, actions.getItemUseApCost(this.target, this.slotName));

    while (ap >= itemAp) {
      if (weapon.script.zoneSize > 0)
        actions.pushItemUseAt(this.target.position.x, this.target.position.y, this.slotName);
      else
        actions.pushItemUse(this.target, this.slotName);
      ap -= itemAp;
    }
    return ap;
  }

  checkWeaponAmmo(ap, actions, weapon) {
    if (weapon.maxAmmo > 0 && weapon.ammo === 0 && ap > 2) {
      console.log(this.logPrefix, "- out of ammo -> reloading.");
      if (weapon.script.availableAmmo === 0) {
        console.log(this.logPrefix, "- no ammo left -> giving up for now");
        return "ko";
      }
      weapon.useMode = "reload";
      actions.pushItemUse(null, this.slotName);
      weapon.useMode = weapon.defaultUseMode;
      return "reload";
    }
    return "ok";
  }

  evaluateUseSuccessRate(weapon) {
    console.log(this.logPrefix, "evluating use success rate", weapon, weapon?.script, weapon?.script?.getUseSuccessRate);
    return weapon?.script?.getUseSuccessRate ? weapon.script.getUseSuccessRate(this.target) : 100;
  }

  hasAcceptableUseSuccessRate(weapon) {
    console.log(this.logPrefix, "success rate evaluated at", this.evaluateUseSuccessRate(weapon), '>', this.useSuccessRateThreshold);
    return this.evaluateUseSuccessRate(weapon) > this.useSuccessRateThreshold;
  }

  findBestPosition(weapon) {
    const actions = this.model.actionQueue;
    const range = weapon.getRange();
    let movement = 0;
    let pathEval;
    let pathMethod;

    if (!weapon.isInRange(this.target) || !this.model.hasLineOfSight(this.target) || !this.hasAcceptableUseSuccessRate(weapon)) {
      console.log(this.logPrefix, "position inadequate. looking for better hoofing.");
      movement = -1;
      if (weapon.script?.getUseSuccessRateAt && !this.hasAcceptableUseSuccessRate(weapon)) {
        pathMethod = "pushForceReach";
        pathEval = evaluatePathfindingOptionForWeapon.bind(this, this.target, weapon, this.useSuccessRateThreshold);
        movement = actions.getForcedReachApCost(this.target, range, pathEval);
        console.log(this.logPrefix, "try to find best shooting position: ", movement);
        if (movement === -1) {
          pathEval = evaluatePathfindingOptionForWeapon.bind(this, this.target, weapon, this.evaluateUseSuccessRate(weapon) + 5);
          movement = actions.getForcedReachApCost(this.target, range, pathEval);
          console.log(this.logPrefix, "settling for better shooting position");
        }
      }
      if (movement === -1) {
        pathMethod = "pushReach";
        pathEval = evaluatePathfindingOption.bind(this, this.target);
        movement = actions.getReachApCost(this.target, range, pathEval);
        console.log(this.logPrefix, "settle for a line of sight", movement);
      }
    }
    if (movement < 0)
      console.log(this.logPrefix, "combat target is unreachable, no movement possible");
    return { ap: movement, pathEval, pathMethod };
  }
}
