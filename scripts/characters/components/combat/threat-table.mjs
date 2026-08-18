export default class ThreatTable {
  constructor() {
    this._entries = new Map();
    this.decayFactor = 0.85; // threat kept per turn (15% forgotten/turn)
    this.pruneThreshold = 1; // below this, just forget the attacker
  }

  register(character, amount) {
    if (!character || !(amount > 0))
      return;
    this._entries.set(character, this.get(character) + amount);
  }

  get(character) {
    return this._entries.get(character) || 0;
  }

  clear(character) {
    this._entries.delete(character);
  }

  decay() {
    for (const [character, value] of this._entries) {
      let alive = false;
      try { alive = character.isAlive(); } catch (err) { alive = false; }
      if (!alive) {
        this._entries.delete(character);
        continue ;
      }
      const decayed = value * this.decayFactor;
      if (decayed < this.pruneThreshold)
        this._entries.delete(character);
      else
        this._entries.set(character, decayed);
    }
  }
}
