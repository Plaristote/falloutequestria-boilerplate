import {CharacterBehaviour} from "./../character.mjs";
import {skillCheck} from "../../cmap/helpers/checks.mjs";

function getQuest() {
  return game.quests.getQuest("junkvilleDumpsDisappeared");
}

function healCriticalFail(model, user) {
  model.takeDamage(model.statistics.hitPoints + 1, user);
  game.appendToConsole(i18n.t("quests.junkvilleDumpsDisappeared.medicine-critical-fail"));
  game.diplomacy.setAsEnemy(true, "player", "diamond-dogs");
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
    if (!this.model.hasVariable("questHealed")) {
      const quest = getQuest();
      const healStep = 4 - quest.script.woundedDogs;

      skillCheck(user, "medicine", {
        dice: 10,
        target: 50 + healStep * 10,
        success: () => {
          game.appendToConsole(i18n.t(`quests.junkvilleDumpsDisappeared.medicine-success-${healStep}`));
          this.onHealed();
          quest.script.woundedDogs--;
        },
        failure: () => {
          this.healAttempts++;
          if (this.healAttempts > 3)
            healCriticalFail(this.model, user);
          else
            game.appendToConsole(i18n.t(`quests.junkvilleDumpsDisappeared.medicine-failure`));
        },
        criticalFailure: () => {
          healCriticalFail(this.model, user);
        }
      });
      return true;
    }
    return super.onUseMedicine(user);
  }

  onHealed() {
    const actions = this.model.actionQueue;

    this.model.setVariable("questHealed", 1);
    this.model.wakeUp();
    game.dataEngine.addReputation("diamond-dogs", 15);
    level.findGroup("pack").appendObject(this.model);
    actions.pushReachCase(25, 53, 0, 3);
    actions.start();
    this.model.setScript("junkville/pack-member.mjs");
  }

  get healAttempts() {
    return this.model.getVariable("healAttempts", 0);
  }

  set healAttempts(value) {
    this.model.setVariable("healAttempts", value);
  }
}
