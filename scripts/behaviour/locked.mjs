import {getValueFromRange} from "./random.mjs";
import {skillCheck} from "../cmap/helpers/checks.mjs";

function getEquippedLockpickToolsFor(character) {
  for (var slotI = 1 ; slotI <= 2 ; ++slotI) {
    const item = character.inventory.getEquippedItem(`use-${slotI}`);

    if (item && item.objectName.startsWith("lockpick"))
      return item;
  }
  return null;
}

export class LockedComponent {
  constructor(parent, options = {}) {
    this.lockpickLevel = options.lockpickLevel !== undefined ? options.lockpickLevel : 1;
    this.breakable = options.breakable || true;
    this.model = parent.model;
    this.onSuccess = options.onSuccess;
    this.onFailure = options.onFailure;
    this.onCriticalFailure = options.onCriticalFailure;
    if (!this.model.hasVariable("lock-xp"))
      this.xpReward = options.xp || (25 + this.lockpickLevel * 75);
  }

  get xpReward() {
    return this.model.getVariable("lock-xp");
  }

  set xpReward(value) {
    this.model.setVariable("lock-xp", value);
  }
  
  toggleLocked() {
    this.model.playSound("door-unlock");
    this.model.locked = !this.model.locked;
  }
  
  isBroken() {
    return this.model.hasVariable("broken") ? this.model.getVariable("broken") : false;
  }

  onUseLockpick(user, defaultBonus = 0) {
    if (!this.isBroken()) {
      const item  = getEquippedLockpickToolsFor(user);
      const itemBonus = item ? (item.script.lockpickBonus || 0) : 0;
      const bonus = Math.max(itemBonus, defaultBonus);

      console.log("Target=", 65, '+', this.lockpickLevel, '*', 25, '-', bonus);
      return skillCheck(user, 'lockpick', {
        target: 65 + this.lockpickLevel * 25 - bonus,
        success: this.onLockpickSuccess.bind(this, user),
        failure: this.onLockpickFailure.bind(this, user),
        criticalFailure: this.onLockpickCriticalFailure.bind(this, user)
      });
    }
    else if (user === level.player)
      game.appendToConsole(i18n.t("messages.lock-is-broken"));
    return false;
  }

  onLockpickSuccess(user) {
    this.toggleLocked();
    this.onSuccess(user);
    if (user === level.player && this.xpReward > 0)
      game.appendToConsole(i18n.t("messages.xp-gain", {xp: this.xpReward}));
    if (this.xpReward > 0) {
      user.statistics.addExperience(this.xpReward);
      this.xpReward = 0;
    }
  }

  onLockpickCriticalFailure(user) {
    const breakable = user === level.player
		   && this.breakable
		   && getValueFromRange(0, 10) > user.statistics.luck;

    if (breakable) {
      this.model.setVariable("broken", true);
      this.onCriticalFailure(user);
    }
    else
      this.onLockpickFailure(user);
  }

  onLockpickFailure(user) {
    this.onFailure(user);
  }
}
