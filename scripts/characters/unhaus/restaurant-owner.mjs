import {CharacterBehaviour} from "./../changeling.mjs";

export default class extends CharacterBehaviour {
  constructor(model) {
    super(model);
    this.dialog = "unhaus/restaurant-owner";
  }

  initialize() {
    this.changelingTransform("earth-pony", {
      faceColor: "#33949f",
      eyeColor: "#2530ff",
      hairColor: "#cfcf02",
      hairTheme: "shining",
      faceTheme: "mare-basic"
    });
  }
}
