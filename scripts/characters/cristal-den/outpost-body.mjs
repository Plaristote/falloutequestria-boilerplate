import {CharacterBehaviour} from "./../character.mjs";

export default class extends CharacterBehaviour {
  constructor(model) {
    super(model);
    if (this.model.isAlive())
      this.model.takeDamage(this.model.statistics.hitPoints, null);
  }

  get quest() {
    return game.quests.getQuest("cristal-den/copper-outpost");
  }

  initialize() {
    this.model.takeDamage(this.model.statistics.hitPoints, null);
  }

  onLook() {
    if (this.model.floor === 0) {
      if (this.quest.script.inspectScoutBodyTest())
        game.appendToConsole(this.quest.tr("inspect-body-floor-0-success"));
      else
        game.appendToConsole(this.quest.tr("inspect-body-floor-0-failure"));
    } else {
      quest.setVariable("inspect-body-success", 1);
      game.appendToConsole(this.quest.tr("inspect-body-floor-1"));
    }
    return true;
  }
}
