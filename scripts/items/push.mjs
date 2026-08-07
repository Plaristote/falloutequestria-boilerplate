import {randomCheck} from "../behaviour/random.mjs";

// Reuses the same resistance-check/push-away pattern as
// behaviour/explosion.mjs's Explosion#applyDamageOnCharacter, for melee
// weapons that have a chance to knock a character back.
//
// options:
//   resistanceReduction - lowers the character's effective resistance,
//                         making a push more likely (default 0)
//   slideMultiplier     - scales how far the character is pushed (default 1)
export function attemptPushAway(character, damage, position, options = {}) {
  const resistanceReduction = options.resistanceReduction || 0;
  const slideMultiplier     = options.slideMultiplier || 1;
  const resistance = Math.max(0,
    character.statistics.strength * 2 + character.statistics.endurance + character.statistics.agility - resistanceReduction
  );

  randomCheck(resistance, {
    failure:         () => pushAway(character, damage, position, slideMultiplier),
    criticalFailure: () => {
      pushAway(character, damage, position, slideMultiplier);
      character.addBuff("ko");
    }
  });
}

function pushAway(character, damage, position, slideMultiplier) {
  const slideDistance = Math.max(1, damage / 10) * slideMultiplier;

  character.fallAwayFrom(position.x, position.y, slideDistance);
}
