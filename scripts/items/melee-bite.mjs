import {MeleeAttack} from "./melee.mjs";

function biteSoundForCharacter(model) {
  switch (model.statistics.race) {
    case "wolf":
    case "dog":
    case "timberwolf":
      return "critters/dog/bite";
  }
  return "critters/bite";
}

class Bite extends MeleeAttack {
  constructor(model) {
    super(model);
    this.hitSound = biteSoundForCharacter(this.user);
  }

  getActionPointCost() {
    return 4;
  }

  getDamageRange() {
    const baseDamage = Math.ceil(this.getDamageBase()) + 2;
    const range      = Math.ceil(baseDamage / 10);

    return [baseDamage, range]; 
  }
};

export function create(model) {
  return new Bite(model);
}
