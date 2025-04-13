function overrideOnTurnStart(target, callback) {
  const originalCallback = target.onTurnStart.bind(target);

  target.onTurnStart = function() {
    callback();
    return originalCallback();
  }
}

export class SquadFighterComponent {
  constructor(script) {
    this.model = script.model;
    this.script = script;
    overrideOnTurnStart(this.script, this.callSquadToCombat.bind(this));
  }

  get squad() { return this.script.squad || this.model.parent.objects; }

  callSquadToCombat() {
    if (this.squad) {
      const target = this.script.requireCombatTarget();

      for (var i = 0 ; i < this.squad.length ; ++i) {
       if (!level.isInCombat(this.squad[i])) {
          level.joinCombat(this.squad[i]);
          this.squad[i].combatTarget = target;
       }
     }
    }
  }
}
