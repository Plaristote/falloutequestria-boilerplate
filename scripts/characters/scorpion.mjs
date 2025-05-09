import {Rat} from "./rat.mjs";

export default class extends Rat {
  playReactionSound(reaction) {
    if (reaction === "damaged" || reaction === "dead")
      game.sounds.play("critters/scorpion/${reaction}")
  }
}
