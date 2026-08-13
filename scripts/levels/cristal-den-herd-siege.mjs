import {LevelBase} from "./base.mjs";

function removeLiveCharacter(character) {
  if (character.isAlive())
    level.deleteObject(character);
}

export default class extends LevelBase {
  get quest() {
    return game.quests.getQuest("cristal-den/bibins-rescue-herd");
  }

  get scouts() {
    return Array.from(level.findGroup("scouts").objects);
  }

  get herders() {
    return Array.from(level.findGroup("herd").objects);
  }

  onExit() {
    if (this.quest) {
      if (this.quest.isObjectiveFailed("rescue"))
        this.scoutRemoval();
      else if (this.quest.isObjectiveCompleted("rescue"))
        this.herdRemoval();
    }
  }

  herdWithdraw() {
    this.herders.forEach(character => character.script.goToLevelExit());
  }

  scoutWithdraw() {
    this.scouts.forEach(character => character.script.goToLevelExit());
  }

  scoutRemoval() {
    this.scouts.forEach(removeLiveCharacter);
  }

  herdRemoval() {
    this.herders.forEach(removeLiveCharacter);
  }
}
