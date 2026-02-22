export default class {
  constructor(model) {
    this.model = model;
  }

  onLoaded() {
    this.owner = level.findObject("weapon-shop.owner");
  }

  onZoneEntered(object) {
    if (object === game.player && this.owner && this.owner.fieldOfView.isDetected(object)) {
      this.owner.script.onIntruderDetected();
    }
  }
}
