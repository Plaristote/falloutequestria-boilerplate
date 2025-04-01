import {LockedComponent} from "./locked.mjs";

export class LockedStorage {
  constructor(model, options = { lockpickLevel: 2, breakable: true }) {
    this.model = model;
    this.lockedComponent = new LockedComponent(this, {
      lockpickLevel: options.lockpickLevel,
      breakable: options.breakable == true,
      onSuccess: this.onLockpickSuccess.bind(this),
      onFailure: this.onLockpickFailure.bind(this),
      onCriticalFailure: this.onLockpickCriticalFailure.bind(this)
    });
    this.lockedComponent.toggleLocked = this.toggleLocked.bind(this);
  }

  getAvailableInteractions() {
    return ["use", "look", "use-object", "use-skill"];
  }
  
  get locked() {
    return this.model.hasVariable("locked") ? this.model.getVariable("locked") : true
  }
  
  toggleLocked() {
    this.model.setVariable("locked", !this.locked);
  }
  
  onLockpickSuccess(user) {
    const word = (this.locked ? '' : 'un') + 'locked';
    game.appendToConsole(i18n.t(`messages.locker-${word}`));
  }
  
  onLockpickFailure(user) {
    const word = (this.locked ? 'un' : '') + 'locked';
    game.appendToConsole(i18n.t(`messages.locker-${word}-failed`));
  }
  
  onLockpickCriticalFailure(user) {
    if (this.lockedComponent.breakable)
      game.appendToConsole(i18n.t("messages.locker-broken"));
    else
      this.onLockpickFailure(user);
  }

  onUse() {
    if (this.locked) {
      game.appendToConsole(i18n.t("messages.locker-locked"));
      return true;
    }
    return false;
  }
  
  onUseLockpick(user) {
    this.lockedComponent.onUseLockpick(user);
    return true;
  }
  
  onUseSteal() {
    return this.onUse();
  }
}

export function create(model) {
  return new LockedStorage(model);
}
