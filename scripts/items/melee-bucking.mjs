import {MeleeAttack} from "./melee.mjs";
import Hoofercut from "./melee-hoofercut.mjs";

class Bucking extends Hoofercut {
  getActionPointCost() {
    return 4;
  }

  getDamageRange() {
    return [Math.ceil(this.getDamageBase() * 1.5), 5]; 
  }

  playMissSound() {
    game.sounds.play(this.user, "ponies/melee/miss");
  }

  playHitSound(target, damage) {
    let type = "light";
    if (damage > 25) type = "hard";
    else if (damage > 10) type = "strong";
    game.sounds.play(target, `ponies/melee/hit-${type}`);
  }
};

export function create(model) {
  return new Bucking(model);
}
