import {LevelBase} from "./base.mjs";

export default class extends LevelBase {
  get quest() {
    return game.quests.getQuest("cristal-den/bibins-rescue-herd");
  }

  get scouts() {
    return level.findGroup("scouts").objects;
  }

  get herders() {
    return level.findGroup("herd").objects;
  }

  onExit() {
    if (this.quest && this.quest.isObjectiveFailed("rescue"))
      this.scoutRemoval();
  }

  herdWithdraw() {
    this.herders.forEach(character => character.script.goToLevelExit());
  }

  scoutWithdraw() {
    this.scouts.forEach(character => character.script.goToLevelExit());
  }

  scoutRemoval() {
    this.scouts.forEach(character => level.deleteObject(character));
  }
}
