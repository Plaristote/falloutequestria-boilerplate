import {getValueFromRange, isJinxed} from "../../behaviour/random.mjs";

export function skillContest(attacker, defender, skills, diceType = 100) {
  var skill1, skill2, roll1, roll2;

  if (attacker.character === undefined)
    attacker = { character: attacker, bonus: 0 };
  if (defender.character === undefined)
    defender = { character: defender, bonus: 0 };
  if (typeof skills == "string")
    skill1 = skill2 = skills;
  else {
    skill1 = skills[0];
    skill2 = skills[1];
  }
  skill1 = modifiedSkillValue(attacker.character, skill1, defender.character);
  skill2 = modifiedSkillValue(defender.character, skill2, attacker.character);
  roll1  = diceType > 0 ? getValueFromRange(0, diceType, attacker.character) : 0;
  roll2  = diceType > 0 ? getValueFromRange(0, diceType, defender.character) : 0;
  console.log("SkillContest:");
  console.log(` attacker: ${attacker.character.path}, roll: ${roll1}, skill: ${skill1}, bonus: ${attacker.bonus}`);
  console.log(` defender: ${defender.character.path}, roll: ${roll2}, skill: ${skill2}, bonus: ${defender.bonus}`);
  if (roll1 + skill1 + attacker.bonus >= roll2 + skill2 + defender.bonus)
    return attacker.character;
  return defender.character;
}

export function multipleSkillContest(attacker, defender, skills, diceType = 100) {
  let wins = 0;
  const results = skills.map(skill => {
    return skillContest(attacker, defender, skill, diceType);
  });
 results.forEach(result => { if (result === attacker) { wins++; }});
 console.log("Grouped SkillContest result:", wins,  '/', skills.length);
 return wins / skills.length;
}

export function skillCheck(user, skill, options = {}) {
  const skillValue = modifiedSkillValue(user, skill);
  const dice       = options.dice ? options.dice : 100;
  const target     = options.target ? options.target : 100;
  const roll       = getValueFromRange(0, dice, user);
  const critical   = Math.ceil(modifiedSkillValue(user, "criticalChance") / 100 * dice);
  const criticalFail = Math.floor((isJinxed(game.player) ? 15 : 5) / 100 * dice);
  var callback;
  var success = false;

  console.log(`SkillCheck '${skill}': base=${skillValue}, target=${target}, roll=${roll}`);
  if (roll >= dice - critical) {
    callback = options.criticalSuccess || options.success;
    success = true;
  } else if (roll + skillValue >= target) {
    callback = options.success;
    success = true;
  } else if (roll <= Math.ceil(dice / 100 * criticalFail))
    callback = options.criticalFailure || options.failure;
  else
    callback = options.failure;
  if (callback)
    callback();
  return success;
}

export function modifiedSkillValue(user, skill, target) {
  return user.statistics[skill] + bonusForSkill(user, skill, target);
}

export function bonusForSkill(user, skill, target) {
  return 0;
}

export function stealCheck(user, target, item, quantity, callbacks) {
  var threshold = target.statistics.perception * 12;
  var weight    = item.weight / item.quantity * quantity;

  if (target.fieldOfView.isDetected(user))
    threshold += 40;
  threshold += weight;
  return skillCheck(user, "steal", {
    target:          threshold,
    failure:         callbacks.failure,
    criticalFailure: callbacks.criticalFailure || callbacks.failure
  });
}
