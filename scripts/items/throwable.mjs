import {ItemBehaviour} from "./item.mjs";
import {getValueFromRange, randomCheck} from "../behaviour/random.mjs";

export function throwCurve(percentage) {
  let xDelta = (percentage * (target.x - from.x));
  let yDelta = (percentage * (target.y - from.y));
  if (percentage < 0.5)
    yDelta -= dist * percentage;
  else
    yDelta -= dist * (1 - percentage);
  return {
    x: from.x + xDelta,
    y: from.y + yDelta
  };
}

export class ThrowableBehaviour extends ItemBehaviour {
  constructor(model) {
    super(model);
    this.skill = "unarmed";
    this.useModes = ["throw"];
    this.zoneSize = 0;
  }

  get zoneTarget() {
    return this.isThrowing();
  }

  get triggersCombat() {
    return this.isThrowing();
  }

  get requiresTarget() {
    return this.isThrowing();
  }

  isThrowing() {
    return this.model.useMode === "throw";
  }

  attemptToUseAt(x, y) {
    if (this.user.useActionPoints(this.getActionPointCost()))
      return this.triggerUseAt(x, y);
    else
      this.logFailure(i18n.t("messages.not-enough-ap"));
    return false;
  }

  disperseThrow(x, y) {
    const fromX = Math.min(x, this.user.position.x);
    const toX   = Math.max(x, this.user.position.x);
    const fromY = Math.min(y, this.user.position.y);
    const toY   = Math.max(y, this.user.position.y);
    const distanceX = toX - fromX;
    const distanceY = toY - fromY;

    x = x + getValueFromRange(-1, distanceX) * (toX < fromX ? 1 : -1);
    y = y + getValueFromRange(-1, distanceY) * (toY < fromY ? 1 : -1);
    return [x,y];
  }

  onCriticalFailure() {
    game.appendToConsole(i18n.t("messages.weapons.critical-failure", {
      user: this.user.statistics.name,
      item: this.trName
    }));
    return [this.user.position.x, this.user.position.y]
  }
 

  triggerUseAt(x, y) {
    const successRate = this.getUseAtSuccessRate(x, y);
    const roll = getValueFromRange(0, 100);
    let dispersedPos;

    randomCheck(successRate, {
      criticalFailure: () => {
        dispersedPos = this.onCriticalFailure();
      },
      failure: () => {
        dispersedPos = this.disperseThrow(x, y);
      },
      success: () => {}
    });
    if (dispersedPos) {
      x = dispersedPos[0];
      y = dispersedPos[1];
    }
    return {
      steps:    this.getThrowAnimationSteps(x, y),
      callback: this.useAt.bind(this, x, y)
    };
  }

  useAt(x, y) {
    const oldQuantity = this.model.quantity;
    const user = this.user;

    this.model.quantity = 1;
    user.inventory.dropItem(this.model);
    level.setObjectPosition(this.model, x, y);
    if (oldQuantity > 1)
      user.inventory.addItemOfType(this.model.itemType, oldQuantity - 1);
    return true;
  }

  getThrowAnimationSteps(x, y) {
    const steps  = this.getUseAnimation();
    const from   = this.user.spritePosition;
    const target = level.getRenderPositionForTile(x, y);

    if (from.x != target.x || from.y != target.y) {
      steps.push({
        type: "Sprite",
        name: "items",
        animation: this.model.itemType,
        fromX: from.x, fromY: from.y,
        toX: target.x, toY: target.y,
        speed: 250,
        position: throwCurve
      });
    }
    return steps;
  }

  getRange() {
    if (this.model.useMode === "throw") {
      const strength = this.user.statistics.strength;

      return Math.max(3, strength + 1);
    }
  }

  getUseAtSuccessRate(x, y) {
    const attackerWeaponSkill = this.user.statistics[this.skill];
    const distance = this.user.getDistance(x, y);
    var baseToHit = attackerWeaponSkill;

    baseToHit -= 25;
    baseToHit += 8 * Math.max(0, this.user.statistics.perception - 2);
    baseToHit -= Math.max(0, distance - 1) * 7;
    return Math.max(0, Math.min(baseToHit, 95));
  }
}
