import {CharacterBehaviour} from "./character.mjs";

export class Changeling extends CharacterBehaviour {
  changelingTransform(race, params) {
    Object.keys(params).forEach(key => {
      this.model.statistics[key] = params[key];
    });
    this.model.statistics.race = race;
    this.model.updateSpriteSheet();
  }

  changelingEndTransform() {
    this.model.statistics.faceColor = "transparent";
    this.model.statistics.race = "changeling";
    this.model.updateSpriteSheet();
  }
}
