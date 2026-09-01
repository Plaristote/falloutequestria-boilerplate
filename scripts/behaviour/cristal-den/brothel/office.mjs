export default class {
  constructor(model) {
    this.model = model;
  }

  get lightLayer() {
    return level.tilemap.getLightLayer("brothel-office");
  }

  get owner() {
    return level.findObject("brothel.pimp");
  }

  onZoneEntered(object) {
    if (object == this.owner)
      this.lightLayer.visible = true;
  }

  onZoneExited(object) {
    if (object == this.owner)
      this.lightLayer.visible = false;
  }
}
