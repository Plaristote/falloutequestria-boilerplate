export default class {
  constructor(model) {
    this.model = model;
    this.floorNumber = parseInt(this.model.parent.name.slice(-1)) + 1;
  }

  onFloorChanged(floor) {
    this.model.interactive = floor == this.floorNumber;
  }
}
