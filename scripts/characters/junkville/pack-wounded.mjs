import {CharacterBehaviour} from "./../character.mjs";
import {skillCheck} from "../../cmap/helpers/checks.mjs";

function getQuest() {
  return game.quests.getQuest("junkvilleDumpsDisappeared");
}

export default class PackWounded extends CharacterBehaviour {
  constructor(model) {
    super(model);
    this.model.setAnimation("fall");
  }

  initialize() {
    this.model.fallUnconscious();
  }

  onUseMedicine(user) {
    const quest = getQuest();
    const healStep = 4 - quest.script.woundedDogs;

    skillCheck(user, "medicine", {
      dice: 10,
      target: 40 + healStep * 10,
      success: () => {
        game.appendToConsole(`quests.junkvilleDumpsDisappeared.medicine-success-${healStep}`);
        this.onHealed();
        quest.script.woundedDogs--;
      },
      criticalFailure: () => {
        game.appendToConsole("quests.junkvilleDumpsDisappeared.medicine-critical-fail");
        this.model.takeDamage(this.model.statistics.hitPoints + 1, user);
      }
    });
    return true;
  }

  onHealed() {
    const actions = this.model.actionQueue;

    this.model.wakeUp();
    game.dataEngine.addReputation("diamond-dogs", 15);
    level.findGroup("pack").appendObject(this.model);
    actions.pushReachCase(25, 53, 0, 3);
    actions.start();
    this.model.setScript("junkville/pack-member.mjs");
  }
}
