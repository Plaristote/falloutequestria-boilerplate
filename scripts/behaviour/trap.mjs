import {TrappedComponent} from "./trapped.mjs";
import {Explosion} from "./explosion.mjs";
import {getValueFromRange} from "../behaviour/random.mjs";

export class Trap {
  constructor(model) {
    this.model = model;
    this.sneak = 68;
    if (this.model.blocksPath)
      this.model.blocksPath = false;
    this.trappedComponent = new TrappedComponent(this, {
      trapLevel: this.difficulty || 1,
      onSuccess: this.updateAnimation.bind(this),
      onTriggered: this.triggered.bind(this)
    });
    this.updateAnimation();
  }

  initialize() {
    this.model.toggleSneaking(true);
    this.model.interruptOnDetection = true;
  }

  getAvailableInteractions() {
    return ["look", "use-object", "use-skill"];
  }

  onDetected() {
    game.appendToConsole(i18n.t("messages.trap-detected"));
  }

  onLook() {
    const armedMessage = this.trappedComponent.disarmed ? "inspection.disarmed" : "inspection.armed";

    game.appendToConsole(i18n.t("inspection.trap") + ' ' + i18n.t(armedMessage));
    return true;
  }

  onUseExplosives(user) {
    this.trappedComponent.onUseExplosives(user);
    return true;
  }

  updateAnimation() {
    this.model.setAnimation(this.trappedComponent.disarmed ? "off" : "on");
  }

  onZoneEntered(object) {
    if (!this.trappedComponent.disarmed)
      this.triggered();
  }

  triggered() {
    const explosion = new Explosion({ x: this.model.position.x, y: this.model.position.y, z: this.model.floor });

    explosion.withRadius(1)
             .withDamage(getValueFromRange(20, 50))
             .trigger();
    level.deleteObject(this.model);
  }
}

export function create(model) {
  return new Trap(model);
}
