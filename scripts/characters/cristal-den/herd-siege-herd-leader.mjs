import CharacterBehaviour from "./herd-siege-herd-warrior.mjs";
import {requireQuest, QuestFlags} from "../../quests/helpers.mjs";

export default class extends CharacterBehaviour {
  constructor(model) {
    super(model);
    this.speakOnDetection = true;
  }

  get quest() {
    return requireQuest("cristal-den/bibins-rescue-herd", QuestFlags.HiddenQuest);
  }

  get dialog() {
    return !this.quest.isObjectiveCompleted("rescue") ? "cristal-den/bibins/siege-herd-leader" : null;
  }

  canAutoTalk() {
    return super.canAutoTalk() &&
      level.getTileZone("building").isInside(game.player.position.x, game.player.position.y, game.player.floor);
  }
}
