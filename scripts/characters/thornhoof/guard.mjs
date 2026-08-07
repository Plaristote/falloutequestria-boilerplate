import {GuardBehaviour} from "./../guard.mjs";

export default class extends GuardBehaviour {
  constructor(model) {
    super(model);
  }

  onCharacterDetected(character) {
    if (game.getVariable("unlawfullyEnteredThornhoof", 0) == 1)
      game.diplomacy.setAsEnemy(true, "thornhoof", "player");
    return super.onCharacterDetected(character);
  }
}
