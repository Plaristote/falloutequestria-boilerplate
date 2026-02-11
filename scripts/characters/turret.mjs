import {CharacterBehaviour} from "./character.mjs";
import {skillCheck} from "../cmap/helpers/checks.mjs";

export default class Turret extends CharacterBehaviour {
  constructor(model) {
    super(model);
    this.canPush = false;
    if (this.model.isAlive() && !level.combat)
      this.model.tasks.addUniqueTask("popDown", 100, 1);
  }

  popDown() {
    this.model.actionQueue.pushAnimation("fall-down")
    this.model.actionQueue.pushAnimation("sleep");
    this.model.actionQueue.start();
  }

  popUp() {
    this.model.actionQueue.pushAnimation("get-up");
    this.model.actionQueue.start();
  }

  isAsleep() {
    return this.model.getAnimation().startsWith("sleep") || this.model.getAnimation().startsWith("fall-down");
  }

  onUseScience(user) {
    if (user.statistics.faction != this.model.statistics.faction) {
      skillCheck(user, "science", {
        target: 55 + this.model.statistics.level * 18,
        success: () => {
          const xpReward = this.model.statistics.level * 12;
          this.model.statistics.faction = user.statistics.faction;
          user.statistics.addExperience(xpReward);
          if (user == game.player)
            game.appendToConsole(i18n.t("messages.hacked-turret", { xp: xpReward }));
        },
        failure: () => {
          if (user == game.player)
            game.appendToConsole(i18n.t("messages.hacked-turret-fail"));
        },
        criticalFailure: () => {
          this.model.statistics.faction = "critters";
          if (user == game.player)
            game.appendToConsole(i18n.t("messages.hacked-turret-critical-fail"));
        }
      });
      return true;
    }
    return false;
  }

  onUseRepair(user) {
    const friendly = user.statistics.faction == this.model.statistics.faction;
    const damaged = this.model.statistics.hitPoints < this.model.statistics.maxHitPoints;

    if (!this.model.isAlive() || (friendly && !damaged))
      return false;
    skillCheck(user, "repair", {
      target: 55 + this.model.statistics.level * 18,
      success: () => {
        const xpReward = this.model.statistics.level * 12;
        if (friendly) {
          this.model.statistics.hitPoints = this.model.statistics.maxHitPoints;
        } else {
          this.model.takeDamage(this.model.statistics.hitPoints, user);
        }
        user.statistics.addExperience(xpReward);
      },
      failure: () => {
        if (user == game.player)
          game.appendToConsole(i18n.t("messages.repair-failure", { target: this.model.displayName }));
      }
    });
    return true;
  }

  onUseMedicine(user) {
    return false;
  }

  onTurnStart() {
    if (this.isAsleep()) {
      this.popUp(); // Add an animation action and use it here, otherwise it does nothing
      return true;
    }
    super.onTurnStart();
  }

  findCombatTarget() {
    if (!this.combatTarget || !this.combatTarget.isAlive()) {
      const enemies = this.model.fieldOfView.getEnemies();
      const weapon  = this.model.inventory.getEquippedItem("use-1");

      for (var i = 0 ; i < enemies.length ; ++i) {
        if (weapon.isInRange(enemies[i])) {
          this.combatTarget = enemies[i];
          break ;
        }
      }
    }
    return this.combatTarget != null;
  }

  fightCombatTarget() {
    const actions  = this.model.actionQueue;
    const weapon   = this.model.inventory.getEquippedItem("use-1");
    const itemAp   = Math.max(1, actions.getItemUseApCost(this.combatTarget, "use-1"));
    var   ap       = this.model.actionPoints;

    if (weapon.isInRange(this.combatTarget)) {
      actions.reset();
      while (ap >= itemAp) {
        actions.pushItemUse(this.combatTarget, "use-1");
        ap -= itemAp;
      }
      console.log(this.logPrefix, ap, '/', this.model.actionPoints);
      if (ap != this.model.actionPoints)
        return actions.start();
    }
    return null;
  }

  runAwayFromCombatTarget() {
    return null;
  }
}
