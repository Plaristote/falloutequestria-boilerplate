import MeleeAttack from "./melee.mjs";

export default class Hoofercut extends MeleeAttack {
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
