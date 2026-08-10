import CharacterBehaviour from "./herd-siege-enforcer-scout.mjs";

export default class extends CharacterBehaviour {
  constructor(model) {
    super(model);
  }

  get quest() {
    return game.quests.getQuest("cristal-den/bibins-rescue-herd");
  }

  get dialog() {
    if (this.quest && this.quest.script.enforcersWithdrewPeacefully)
      return ;
    return "cristal-den/bibins/siege-enforcer-leader";
  }

  get speakOnDetection() {
    return !this.model.hasVariable("met");
  }
}
