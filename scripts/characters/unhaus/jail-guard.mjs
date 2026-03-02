import {CharacterBehaviour} from "./../character.mjs";

export default class extends CharacterBehaviour {
  constructor(model) {
    super(model);
  }

  get dialog() {
    const quest = game.quests.getQuest("changelingQuest");
    return quest && quest.getVariable("kidnapped", 0) == 1 ? "unhaus/jail-guard" : null;
  }
}
