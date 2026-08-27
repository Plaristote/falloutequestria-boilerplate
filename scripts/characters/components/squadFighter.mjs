function overrideMethod(target, methodName, callback) {
  const original = typeof target[methodName] == "function" ? target[methodName].bind(target) : () => {};

  target[methodName] = function(...args) {
    callback(...args);
    return original(...args);
  }
}

function overrideGetter(target, propertyName, getter) {
  Object.defineProperty(target, propertyName, { get: getter, configurable: true });
}

export class SquadFighterComponent {
  constructor(script) {
    this.model = script.model;
    this.script = script;
    overrideMethod(this.script, "onTurnStart", this.callSquadToCombat.bind(this));
    overrideMethod(this.script, "onDied", this.notifySquadOfDeath.bind(this));
    overrideGetter(this.script, "moraleImmune", () => this.hasLeader);
    overrideGetter(this.script, "judgementSource", () => this.hasLeader ? this.leader : undefined);
    this.script.adjustThreat = this.adjustThreat.bind(this);
    this.moraleLossOnSquadDeath = 15;
    this.leaderMoraleLossMultiplier = 1.5;
  }

  get squad() { return this.script.squad || this.model.parent?.objects; }

  get squadMates() {
    const faction = this.model.statistics.faction;
    return (this.squad || []).filter(character => character.type == "Character" && character.statistics.faction == faction && character !== this.model);
  }

  get leader()    { return this.computeLeader(); }
  get hasLeader() { return this.leader != null; }
  get isLeader()  { return this.leader === this.model; }

  computeLeader(forceIncluded = null) {
    const candidates = (this.squad || []).filter(character =>
      character.type == "Character" && (character === forceIncluded || character.isAlive()));
    if (candidates.length === 0)
      return null;

    if (typeof this.script.selectSquadLeader == "function") {
      const chosen = this.script.selectSquadLeader(candidates);
      return chosen;
    }
    return candidates.reduce((best, character) =>
      (!best || character.statistics.level > best.statistics.level) ? character : best, null);
  }

  notifySquadOfDeath() {
    const wasLeader = this.computeLeader(this.model) === this.model;
    const moraleLoss = wasLeader
      ? this.moraleLossOnSquadDeath * this.leaderMoraleLossMultiplier
      : this.moraleLossOnSquadDeath;
    let trashTalkTriggered = false;

    for (const mate of this.squadMates) {
      if (mate.isAlive()) {
        this.reduceMorale(mate, moraleLoss);
        if (!trashTalkTriggered)
          trashTalkTriggered = mate.script?.trashTalker?.triggerTaunt("squadmateDied");
      }
    }
  }

  reduceMorale(character, amount) {
    character.morale = Math.max(0, character.morale - amount);
  }

  callSquadToCombat() {
    if (this.squad) {
      const target = this.script.requireCombatTarget();

      for (var i = 0 ; i < this.squad.length ; ++i) {
        const character = this.squad[i];
        if (character.type == "Character" && !level.isInCombat(character)) {
           level.joinCombat(character);
           this.squad[i].combatTarget = target;
        }
      }
    }
  }

  // BEGIN Focus Fire
  // 0 = every member reads the battlefield purely off their own threat
  // table (today's behavior); 1 = every member's threat reading is fully
  // replaced by the squad's shared average, so they converge hard onto the
  // same target. Kept well below 1 by default - full convergence reads as
  // pretty merciless focus-fire from the player's side of the fight.
  get focusFireStrength() { return 0.35; }
  // Bonus convergence applied while a leader is alive to rally the squad.
  get leaderFocusFireBonus() { return 0.3; }
  // Convergence is multiplied by this once the squad has no leader left -
  // losing the leader should hurt coordination noticeably.
  get leaderlessFocusFireFactor() { return 0.4; }

  get effectiveFocusFireStrength() {
    let strength = this.focusFireStrength;
    if (this.hasLeader)
      strength = Math.min(1, strength + this.leaderFocusFireBonus);
    else
      strength *= this.leaderlessFocusFireFactor;
    return strength;
  }
  // END Focus Fire

  // BEGIN Threat Convergence
  squadThreatFor(candidate) {
    let total = 0;
    let count = 0;

    for (const mate of this.squadMates) {
      if (!mate.isAlive())
        continue ;
      const table = mate.script?.threatTable;
      if (table) {
        total += table.get(candidate);
        count++;
      }
    }
    return count > 0 ? total / count : 0;
  }

  adjustThreat(candidate, rawThreat) {
    const strength = this.effectiveFocusFireStrength;
    if (strength <= 0)
      return rawThreat;
    return rawThreat * (1 - strength) + this.squadThreatFor(candidate) * strength;
  }
  // END  Threat Convergence
}
