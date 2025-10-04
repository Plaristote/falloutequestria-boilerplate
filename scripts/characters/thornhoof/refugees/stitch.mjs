import HiddenRefugee from "./hiddenRefugee.mjs";

export default class Stitch extends HiddenRefugee {
  constructor(model) {
    super(model);
  }

  get dialog() {
    if (this.speakOnDetection)
      return "thornhoof/refugees/stitch";
    return null;
  }

  get speakOnDetection() {
    return !this.model.hasVariable("met")
        && level.name == "thornhoof-industrial-zone"
        && this.model.floor != 0;
  }
}
