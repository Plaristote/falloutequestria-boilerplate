import {CharacterBehaviour} from "./../character.mjs";

class PotiokSpy extends CharacterBehaviour {
  constructor(model) {
    super(model);
  }

  get escapeQuest() {
    return game.quests.getQuest("cristal-den/potioks-spy");
  }

  get dialog() {
    if (this.escapeQuest && this.escapeQuest.hasObjective("escortSpy"))
      return null;
    return "cristal-den/bibins/potiok-spy";
  }
}

export function create(model) {
  return new PotiokSpy(model);
}
