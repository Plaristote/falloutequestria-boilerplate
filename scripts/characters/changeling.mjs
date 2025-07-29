import {CharacterBehaviour} from "./character.mjs";

export default class Changeling extends CharacterBehaviour {
  changelingImitate(model) {
    this.changelingTransform(model.statistics.race, {
      faceColor: model.statistics.faceColor,
      eyeColor: model.statistics.eyeColor,
      hairColor: model.statistics.hairColor,
      hairTheme: model.statistics.hairTheme,
      faceTheme: model.statistics.faceTheme
    });
  }

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
