import {CharacterBehaviour} from "./character.mjs";

export default class Changeling extends CharacterBehaviour {
  changelingTransform(race, params) {
    const buff = this.model.getBuff("polymorphed");

    this.polymorphParams = params;
    this.polymorphParams.race = race;
    if (!buff) {
      this.model.addBuff("polymorphed");
    } else {
      buff.script.initialize();
    }
  }

  changelingEndTransform() {
    const buff = this.model.getBuff("polymorphed");
    if (buff)
      buff.remove();
  }
}
