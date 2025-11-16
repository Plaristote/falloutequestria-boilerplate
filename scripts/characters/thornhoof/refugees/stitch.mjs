import HiddenRefugee from "./hiddenRefugee.mjs";

export default class Stitch extends HiddenRefugee {
  constructor(model) {
    super(model);
  }

  get dialog() {
    return "thornhoof/refugees/stitch";
  }

  get isInCave() {
    return level.name == "thornhoof-industrial-zone"
        && this.model.floor != 0;
  }

  get speakOnDetection() {
    return this.isInCave;
  }
}
