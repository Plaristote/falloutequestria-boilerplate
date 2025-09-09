import {skillCheck} from "../cmap/helpers/checks.mjs";
import {getValueFromRange} from "../behaviour/random.mjs";

function exhaustionLevel(character) {
  const handle = character.getScriptObject();
  const endurance = character.statistics.endurance + Math.floor(character.statistics.spellcasting / 33);
  const level = Math.max(0, handle.castCount - endurance);

  if (level && character === game.player)
    game.appendToConsole(i18n.t("messages.spellcast-exhausted"));
  return level;
}

function exhaustion(character) {
  const handle = character.getScriptObject();

  handle.castCount++;
  character.tasks.addTask("reduceSpellExhaustion", 120000);
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

export function spellCast(difficulty, character, callbacks) {
  const malus = exhaustion(character);
  var callback;

  console.log("spellCast attempt by", character.displayName, "difficulty", difficulty, "malus", malus);
  if (typeof callbacks == "function")
    callbacks = { success: callbacks };
  if (!callbacks.failure)
    callbacks.failure = defaultFailure;
  skillCheck(character, "spellcasting", {
    target:  difficulty * 25 + malus * 25,
    success: function() { callback = callbacks.success; },
    failure: function() { callback = callbacks.failure; },
    criticalSuccess: function() { callback = callbacks.criticalSuccess || callbacks.success; },
    criticalFailure: function() { callback = callbacks.criticalFailure || callbacks.failure; }
  });
  return {
    steps: [{ type: "Animation", animation: "use", object: character }],
    callback: callback
  };
}
