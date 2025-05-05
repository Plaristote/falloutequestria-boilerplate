import {getValueFromRange} from "../behaviour/random.mjs";

function availableEncounters() {
  const zones = game.worldmap.getCurrentZones();
  let array = [];

  array.push(function(difficultyRoll) { return { "name": "Rats",      "avoidRoll": (55 + difficultyRoll / 4), "members": [{"sheet": "mutatedRat", "script": "rat.mjs",      "amount": Math.max(3, Math.floor(4 * (difficultyRoll / 40)))}] }; });
  array.push(function(difficultyRoll) { return { "name": "Scorpions", "avoidRoll": (65 + difficultyRoll / 4), "members": [{"sheet": "scorpion",   "script": "scorpion.mjs", "amount": Math.max(3, Math.floor(4 * (difficultyRoll / 40)))}] }; });
  array.push(function(difficultyRoll) { return { "name": "Wolves", "avoidRoll": (75 + difficultyRoll / 4), "members": [{"sheet": "wolf", "script": "dog.mjs", "amount": Math.max(4, Math.floor(5 * difficultyRoll / 40))}, {"sheet": "wolf-alpha", "script": "dog.mjs", "amount": 1} ]}});
  array.push(function(difficultyRoll) { return { "name": "Timberwolves", "avoidRoll": (75 + difficultyRoll / 4), "members": [{"sheet": "timberwolf", "script": "dog.mjs", "amount": Math.max(4, Math.floor(5 * difficultyRoll / 40))} ]}});
  return array;
}

export function generateHostileParty() {
  const candidateEncounters = availableEncounters();

  if (candidateEncounters.length) {
    const encounterRoll       = candidateEncounters.length == 1 ? 0 : Math.ceil(Math.random() * candidateEncounters.length) - 1;
    const difficultyRoll      = getValueFromRange(0, 100);
    return candidateEncounters[encounterRoll](difficultyRoll);
  }
  return null;
}

function alreadyHasSimilarParty(array, party) {
  for (let i = 0 ; i < array.length ; ++i) {
    if (array[i].name == party.name)
      return true;
  }
  return false;
}

function appendHostileParty(array) {
  const party = generateHostileParty();
  if (party && !alreadyHasSimilarParty(array, party))
    array.push(party);
}

export function generateHostileEncounter() {
  const parties = [];

  appendHostileParty(parties);
  parties.push(generateHostileParty());
  if (getValueFromRange(0, 10) > 8)
    appendHostileParty(parties);
  for (let i = 0 ; i < parties.length ; ++i)
    parties[i].zone = `encounter-zone-${i}`;
  return parties;
}
