import {CharacterBehaviour} from "../character.mjs";

class Character extends CharacterBehaviour {
  constructor(model) {
    super(model);
    this.dialog = "stable103-overmare";
  }

  onDied() {
    level.script.exitZoneEnabled = true;
    level.setVariable("endGameOnExit", 1);
    game.setVariable("overmareDead", 1);
    if (!game.hasVariable("gameEnding"))
      game.setVariable("gameEnding", "stable-betrayed");
    super.onDied();
  }

  onCharacterDetected(character) {
    const rathian = game.getCharacter("rathian");

    if (character == rathian || (character == game.player && game.playerParty.containsCharacter(rathian)))
      this.model.setAsEnemy(character);
    super.onCharacterDetected(character);
  }
}

export function create(model) {
  return new Character(model);
}
