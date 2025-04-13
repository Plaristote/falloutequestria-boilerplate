import {DialogComponent} from "./dialog.mjs";
import {getValueFromRange} from "../../behaviour/random.mjs";
import {skillCheck, stealCheck} from "../../cmap/helpers/checks.mjs";

const medicineInterval    = 21600000;
const medicineMaxUseCount = 2;

export class SkillTargetComponent extends DialogComponent {
  constructor(model) {
    super(model);
  }

  onUseMedicine(user) {
    const useCount = this.model.hasVariable("medicineUses") ? this.model.getVariable("medicineUses") : 0;
    const useCountBonus = Math.floor(Math.max(0, user.statistics.medicine - 50) / 20);
    const maxUseCount = medicineMaxUseCount + useCountBonus;

    if (!this.model.isAlive())
      game.appendToConsole(i18n.t("messages.invalid-target"));
    else if (level.isInCombat(user))
      game.appendToConsole(i18n.t("medicine-skill.in-combat"));
    else if (useCount + 1 > maxUseCount)
      game.appendToConsole(i18n.t("medicine-skill.max-use-reached", {target: this.model.statistics.name}));
    else {
      const target   = this.model;
      const stats    = target.statistics;
      const maxHeal  = stats.maxHitPoints - stats.hitPoints;
      let   healed   = 0;
      let   duration = getValueFromRange(0, 30) + 10;

      skillCheck(user, "medicine", {
        success: function() {
          console.log("SUCCESS CALLBACK CALLED");
          healed = getValueFromRange(0, 10, user) * Math.min(100, user.statistics.medicine) / 100
                 + user.statistics.medicine / 30;
        },
        criticalFailure: function() {
          healed = -getValueFromRange(1, 11, user);
        }
      });


      healed = Math.ceil(healed);
      healed = Math.min(healed, maxHeal);
      game.asyncAdvanceTime(duration, function() {
        const vars = {
          user:   user.statistics.name,
          target: stats.name,
          hp:     Math.abs(healed)
        }

        if (target.isAlive() && healed > 0) {
          stats.hitPoints += healed;
          game.appendToConsole(i18n.t("medicine-skill.used-on", vars));
          if (game.playerParty.containsCharacter(user)) {
            game.playerParty.addExperience(25);
            game.appendToConsole(i18n.t("messages.xp-gain", {xp: 25}));
          }
        } else if (healed < 0 && -healed >= stats.hitPoints) {
          game.appendToConsole(
            i18n.t(-healed >= stats.hitPoints
              ? "medicine-skill.target-killed"
              : "medicine-skill.critical-fail"
            , vars)
          );
          target.takeDamage(-healed, user);
        } else if (!target.isAlive()) {
          game.appendToConsole(i18n.t("medicine-skill.target-died", vars));
        } else {
          game.appendToConsole(i18n.t("medicine-skill.failure", vars));
        }
      });
      target.setVariable("medicineUses", useCount + 1);
      console.log("Target medicine uses: ", target.getVariable("medicineUses"));
      target.tasks.addTask("medicineSkillWearOff", medicineInterval);
    }
    return true;
  }

  medicineSkillWearOff() {
    const useCount = this.model.getVariable("medicineUses");
    if (useCount > 1) { this.model.setVariable("medicineUses", useCount - 1); }
    else              { this.model.unsetVariable("medicineUses"); }
  }

  onTakeItem(user, item, quantity) {
    console.log("on take item", user, item, quantity);
    if (this.model.isAlive() && !this.model.unconscious) {
      return stealCheck(user, this.model, item, quantity, {
        failure:         this.onStealFailure.bind(this, user, false, item),
        criticalFailure: this.onStealFailure.bind(this, user, true, item)
      });
    }
    return true;
  }

  onPutItem(user, item, quantity) {
    return this.onTakeItem(user, item, quantity);
  }

  onStealFailure(character, critical, item) {
    console.log("onStealFailure", critical);
  }
}
