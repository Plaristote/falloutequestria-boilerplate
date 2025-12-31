//import {Item} from "./item.mjs";
import {ThrowableBehaviour} from "./throwable.mjs";
import {getValueFromRange} from "../behaviour/random.mjs";
import {skillCheck} from "../cmap/helpers/checks.mjs";
import {Explosion} from "../behaviour/explosion.mjs";
import {TrappedComponent} from "../behaviour/trapped.mjs";

export class Dynamite extends ThrowableBehaviour {
  constructor(model) {
    super(model);
    this.useModes = ["use", "throw"];
    this.trappedComponent = new TrappedComponent(this);
  }

  initialize() {
    this.trappedComponent.xpReward = 0;
    this.trappedComponent.disarmed = true;
  }

  get defaultUseMode() {
    return this.trappedComponent.disarmed ? "use" : "throw";
  }

  get requiresTarget() {
    return this.model.useMode != "use";
  }

  getActionPointCost() {
    switch (this.model.useMode) {
    case "throw":
      return 2;
    }
    return 5;
  }

  onLook() {
    const armedMessage = !this.model.tasks.hasTask("triggered") ? "inspection.disarmed" : "inspection.armed";

    game.appendToConsole(i18n.t("inspection.item", {item: this.trName}) + ' ' + i18n.t(armedMessage));
    return true;
  }

  isGroupable(other, defaultValue) {
    return this.model.tasks.hasTask("triggered") ? false : defaultValue;
  }

  useOn(target) {
    console.log("Using dynamite on", target);
    if (target == null) {
      level.openCountdownDialog(this.model);
      return true;
    }
    else
      game.appendToConsole(i18n.t("messages.nothing-happens"));
    return false;
  }

  onCountdownReceived(timeout) {
    const skill = this.user.statistics.explosives;
    const roll  = getValueFromRange(0, 100, this.user);

    skillCheck(this.user, "explosives", {
      success: () => {
        this.model.setVariable("trigger-failed", false);
      },
      failure: () => {
        var difference = getValueFromRange(0, timeout / 2);
        var direction = getValueFromRange(0, 100);

        timeout += direction <= 50 ? -difference : difference;
        this.model.setVariable("trigger-failed", true);
      },
      criticalFailure: () => {
        game.appendToConsole(i18n.t("messages.explosive-critical-failure"));
        this.triggered();
      }
    });
    this.scheduleTrigger(timeout);
    if (this.model.quantity > 1)
      this.splitFromInactiveItems();
  }

  splitFromInactiveItems() {
    const itemsToRecreate = this.model.quantity - 1;

    this.model.quantity = 1;
    this.model.getOwner().inventory.addItemOfType(this.model.itemType, itemsToRecreate);
  }

  scheduleTrigger(timeout) {
    this.trappedComponent.disarmed = false;
    this.model.tasks.addTask("triggered", timeout * 1000, 1);
    this.model.useMode = this.defaultUseMode;
  }

  onUseExplosives(user) {
    this.trappedComponent.onUseExplosives(user);
    return true;
  }

  triggered() {
    const wearer    = this.model.getOwner();
    const position  = {
      x: wearer ? wearer.position.x : this.model.position.x,
      y: wearer ? wearer.position.y : this.model.position.y,
      z: wearer ? wearer.floor : this.model.floor
    };
    const explosion = new Explosion(position);

    explosion.withRadius(2)
             .withDamage(getValueFromRange(20, 50))
             .withWearer(wearer)
             .trigger();
    if (this.model.getVariable("trigger-failed") == true)
      game.appendToConsole(i18n.t("messages.explosive-triggered-prematurely", { item: this.trName }));
    else
      game.appendToConsole(i18n.t("messages.explosive-triggered", { item: this.trName }));
    if (wearer)
      wearer.inventory.destroyItem(this.model, 1);
    else
      level.deleteObject(this.model);
  }
}
