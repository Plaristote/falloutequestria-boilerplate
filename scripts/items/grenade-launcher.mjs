import {Rifle} from "./rifle.mjs";
import {ThrowableBehaviour, throwCurve} from "./throwable.mjs";
import {getValueFromRange} from "../behaviour/random.mjs";
import {explode} from "../behaviour/explosion.mjs";

export default class PlasmaRifle extends Rifle {
  constructor(model) {
    super(model);
    this.skill = "bigGuns";
    this.model.maxAmmo = 10;
    this.zoneSize = 1;
    this.ammoType = "40mm-grenade-ammo";
    this.getUseAtSuccessRate = ThrowableBehaviour.prototype['getUseAtSuccessRate'].bind(this);
    this.disperseThrow       = ThrowableBehaviour.prototype['disperseThrow'].bind(this);
    this.onCriticalFailure   = ThrowableBehaviour.prototype['onCriticalFailure'].bind(this);
    this.triggerUseAt        = ThrowableBehaviour.prototype['triggerUseAt'].bind(this);
  }

  getDamageRange() {
    return [30,65];
  }

  getRange() {
    return 13;
  }

  get zoneTarget() {
    return this.model.useMode === "shoot";
  }

  getSpriteSheetLayers(useSlotId) {
    return [`grenade-launcher-${useSlotId}-back`, `grenade-launcher-${useSlotId}-front`];
  }

  getThrowAnimationSteps(x, y) {
    const animation = this.getWeaponAnimationSteps();
    const from      = this.user.spritePosition;
    const target    = level.getRenderPositionForTile(x, y);

    return [
      { type: "Sound", sound: this.fireAnimationSound, object: this.user },
      { type: "Animation", animation: animation, object: this.user },
      {
        type: "Sprite",
        name: "effects",
        animation: "grenade-throw",
        speed: 250,
        fromX: from.x, fromY: from.y,
        toX: target.x, toY: target.y,
        position: throwCurve
      }
    ];
  }

  attemptToUseAt(x, y) {
    if (this.model.ammo <= 0) {
      this.onOutOfAmmo();
    } else {
      this.model.ammo -= 1;
      if (this.user.useActionPoints(this.getActionPointCost()))
        return this.triggerUseAt(x, y);
      else
        this.logFailure(i18n.t("messages.not-enough-ap"));
    }
    return false;
  }

  useAt(x, y) {
    const damage = getValueFromRange(...this.getDamageRange());

    explode(
      { x: x, y: y },
      this.zoneSize,
      damage,
      null,
      this.user
    );
    return true;
  }
}

