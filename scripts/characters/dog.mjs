import {Rat} from "./rat.mjs";
import {getValueFromRange} from "../behaviour/random.mjs";
import {SquadFighterComponent} from "./components/squadFighter.mjs";

export default class Dog extends Rat {
  constructor(model) {
    super(model);
    this.squadComponent = new SquadFighterComponent(this);
  }

  playReactionSound(reaction) {
    console.log("Called playSoundReaction on Dog", reaction);
    switch (reaction) {
        case "damaged":
          game.sounds.play(`critters/dog/${reaction}-${getValueFromRange(1,2)}`);
          break ;
        case "died":
          game.sounds.play("critters/dog/${reaction}");
          break ;
    }
  }
}
