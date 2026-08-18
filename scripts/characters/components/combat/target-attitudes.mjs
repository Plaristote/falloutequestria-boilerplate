// threat        - accumulated damage this character has dealt to us
// proximity     - falls off with distance, capped by proximityRange
// vulnerability - higher for low-HP targets (easier kill)
// weaponDanger  - average damage of the candidate's equipped weapon
// inRange       - 1 if we could act on this target right now, else 0
// switchMargin  -  how much better an alternative needs to score than our current target before we bother switching

export const DEFAULT_ATTITUDE = "opportunist";

export const ATTITUDES = {
  // Balanced generalist: leans toward whoever's already engaging it, and
  // otherwise prefers closer / weaker targets. Sensible default for most
  // NPCs that don't need a distinct personality.
  opportunist: {
    threat: 1,
    proximity: 4,
    proximityRange: 15,
    vulnerability: 0.5,
    weaponDanger: 0,
    inRangeBonus: 20,
    switchMargin: 1.25
  },

  // Punishes whoever is hurting it the most. A tank/berserker archetype:
  // trades blows head-on rather than picking easy kills.
  bloodthirsty: {
    threat: 3,
    proximity: 1,
    proximityRange: 10,
    vulnerability: 0.1,
    weaponDanger: 0,
    inRangeBonus: 10,
    switchMargin: 1.4
  },

  // Finishes off the weakest / most wounded target first. An opportunistic
  // predator that racks up quick kills rather than trading evenly.
  predator: {
    threat: 0.2,
    proximity: 2,
    proximityRange: 12,
    vulnerability: 3,
    weaponDanger: 0,
    inRangeBonus: 15,
    switchMargin: 1.1
  },

  // Neutralizes the biggest threat in the room pre-emptively - goes after
  // the most dangerous weapon on the field rather than just reacting to
  // damage it has already taken.
  tactician: {
    threat: 0.5,
    proximity: 1,
    proximityRange: 15,
    vulnerability: 0.3,
    weaponDanger: 2.5,
    inRangeBonus: 15,
    switchMargin: 1.3
  }
};

export function getAttitude(name) {
  return ATTITUDES[name] || ATTITUDES[DEFAULT_ATTITUDE];
}
