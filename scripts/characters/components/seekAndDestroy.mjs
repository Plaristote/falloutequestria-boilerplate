const seekAndDestroyIdleTask = "onSeekAndDestroyIdle"

export default class {
  constructor(self, targetFinder) {
    this.targetFinder = targetFinder;
    this.defaultTargetSearch = self.searchForNextCombatTarget ? self.searchForNextCombatTarget.bind(self) : undefined;
    this.defaultShouldOngoingCombat = self.shouldJoinOngoingCombat ? self.shouldJoinOngoingCombat.bind(self) : undefined;
    this.model = self.model;
    self[seekAndDestroyIdleTask] = this.onIdle.bind(this);
  }

  enable() {
    this.model.setVariable("seekAndDestroy", 1);
    this.model.script.searchForNextCombatTarget = this.targetFinder;
    this.model.script.shouldJoinOngoingCombat = function() { return true; };
    this.model.tasks.addUniqueTask(seekAndDestroyIdleTask, 2525 * (1 + Math.random()), 0);
  }

  disable() {
    this.model.unsetVariable("seekAndDestroy");
    this.model.script.onTurnStart = this.defaultOnTurnStart;
    this.model.script.shouldJoinOngoingCombat = this.defaultShouldJoinOngoingCombat;
    this.model.tasks.removeTask(seekAndDestroyIdleTask);
  }

  onLoaded() {
    if (this.model.hasVariable("seekAndDestroy"))
      this.enable();
  }

  onIdle() {
    if (!level.combat && this.model.actionQueue.isEmpty())
      this.headTowardsTarget();
  }

  headTowardsTarget() {
    const target = this.targetFinder();
    const actions = this.model.actionQueue;

    if (target && (!level.combat || this.model.actionPoints > 0)) {
      actions.reset();
      actions.pushReach(target);
      actions.start();
    }
    return !actions.isEmpty();
  }
}
