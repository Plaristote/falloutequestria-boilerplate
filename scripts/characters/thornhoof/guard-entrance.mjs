import {GuardBehaviour} from "./../guard.mjs";

export default class extends GuardBehaviour {
  constructor(model) {
    super(model);
  }

  get metPlayer() {
    return this.model.getVariable("met", 0) == 1;
  }

  set metPlayer(value) {
    this.model.setVariable("met", value ? 1 : 0);
  }

  get dialog() {
    if (!this.metPlayer)
      return "thornhoof/entry-guard";
    return null;
  }

  get speakOnDetection() {
    return !this.metPlayer;
  }
}
