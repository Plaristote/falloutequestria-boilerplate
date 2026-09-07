import {skillCheck} from "../cmap/helpers/checks.mjs";
import {getValueFromRange} from "../behaviour/random.mjs";

const exhaustionRecoveryMin = 2 * 60 * 60 * 1000;
const exhaustionRecoveryMax = 30 * 60 * 1000;

function getExhaustionRecoveryInterval(character) {
  const stat = Math.max(character.statistics.endurance, character.statistics.intelligence);
  const clamped = Math.min(Math.max(stat, 1), 10);
  const ratio = (clamped - 1) / 9;

  return exhaustionRecoveryMin
       - ratio * (exhaustionRecoveryMin - exhaustionRecoveryMax);
}

function rollsMagicExhaustionSave(character) {
  const dice = 10;
  const target = 12;
  const enduranceSuccess = skillCheck(character, "endurance", { dice, target });
  const luckSuccess = skillCheck(character, "luck", { dice, target });
  return enduranceSuccess || luckSuccess;
}

function exhaustionLevel(character) {
  const endurance = character.statistics.endurance + Math.floor(character.statistics.spellcasting / 33);
  const level = Math.max(0, character.script.castCount - endurance);

  if (level && character === game.player)
    game.appendToConsole(i18n.t("messages.spellcast-exhausted"));
  return level;
}

function exhaustion(character) {
  const level = exhaustionLevel(character);

  character.script.castCount++;
  if (level > 0 && !rollsMagicExhaustionSave(character))
    character.addBuff("magic-exhaustion");
  character.tasks.addTask("reduceSpellExhaustion", getExhaustionRecoveryInterval(character));
  return exhaustionLevel(character);
}

function defaultFailure(character) {
  const damage = getValueFromRange(3, 8);

  game.appendToConsole(i18n.t("messages.spellcast-fail", {
    character: character.displayName,
    damage: damage
  }));
  character.takeDamage(damage, null);
}

export function useSuccessTarget(difficulty, character) {
  const malus = exhaustionLevel(character);
  return difficulty * 25 + malus * 25;
}

export function spellCast(difficulty, character, callbacks) {
  const malus = exhaustion(character);
  let callback;
  let success = false;

  console.log("spellCast attempt by", character.displayName, "difficulty", difficulty, "malus", malus);
  if (typeof callbacks == "function")
    callbacks = { success: callbacks };
  if (!callbacks.failure)
    callbacks.failure = defaultFailure;
  success = skillCheck(character, "spellcasting", {
    target:  useSuccessTarget(difficulty, character),
    success: function() { callback = callbacks.success; },
    failure: function() { callback = callbacks.failure; },
    criticalSuccess: function() { callback = callbacks.criticalSuccess || callbacks.success; },
    criticalFailure: function() { callback = callbacks.criticalFailure || callbacks.failure; }
  });
  return {
    steps: [{ type: "Animation", animation: "use", object: character }],
    callback,
    success
  };
}
