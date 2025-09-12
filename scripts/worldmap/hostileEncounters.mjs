import {getValueFromRange} from "../behaviour/random.mjs";
import goldenHerdScoutParty from "./goldenHerdScouts.mjs";
import steelRangerScoutParty from "./steelRangerScouts.mjs";
import crystalDenScoutParty from "./crystalDenScouts.mjs";

function availableEncounters() {
  const zones = game.worldmap.getCurrentZones();
  let array = [];

  if (zones.indexOf("Mountains#1") >= 0 || zones.indexOf("Mountains#2") >= 0) {
    // Wolves
    array.push(function(difficultyRoll) { return { "name": "Wolves", "avoidRoll": (75 + difficultyRoll / 4), "members": [{"sheet": "wolf", "script": "dog.mjs", "amount": Math.max(4, Math.floor(5 * difficultyRoll / 40))}, {"sheet": "wolf-alpha", "script": "dog.mjs", "amount": 1} ]}});
  } else if (zones.indexOf("forest") >= 0) {
    // Timberwolves
    array.push(function(difficultyRoll) { return { "name": "Timberwolves", "avoidRoll": (75 + difficultyRoll / 4), "members": [{"sheet": "timberwolf", "script": "dog.mjs", "amount": Math.max(4, Math.floor(5 * difficultyRoll / 40))} ]}});
  } else {
    // Desert encounters
    array.push(function(difficultyRoll) { return { "name": "Rats",      "avoidRoll": (55 + difficultyRoll / 4), "members": [{"sheet": "mutatedRat", "script": "rat.mjs",      "amount": Math.max(3, Math.floor(4 * (difficultyRoll / 40)))}] }; });
    array.push(function(difficultyRoll) { return { "name": "Scorpions", "avoidRoll": (65 + difficultyRoll / 4), "members": [{"sheet": "scorpion",   "script": "scorpion.mjs", "amount": Math.max(3, Math.floor(4 * (difficultyRoll / 40)))}] }; });
  }
  if (zones.indexOf("capital-surroundings") >= 0) {
    // Roaches, feral ghouls, maybe shadow knights ?
    array.push(function(difficultyRoll) { return { "name": "Roaches",      "avoidRoll": (80 + difficultyRoll / 4), "members": [{"sheet": "roach", "script": "roach.mjs", "amount": 3 + Math.ceil(difficultyRoll / 20)}, {"sheet": "roach-big", "script": "roach.mjs", "amount": Math.ceil(difficultyRoll / 33)}] }; });
    array.push(function(difficultyRoll) { return { "name": "Feral Ghouls", "avoidRoll": (70 + difficultyRoll / 4), "members": [{"sheet": "capital/feral-ghoul-1", "script": "feral-ghoul.mjs", "amount": 2 + Math.ceil(difficultyRoll / 18)}, {"sheet": "capital/feral-ghoul-1", "script": "feral-ghoul.mjs", "amount": 2 + Math.ceil(difficultyRoll / 18)}] }; });
  }
  if (zones.indexOf("golden-horde-siege") >= 0) {
    for (let i = 0 ; i < 6 ; ++i)
      array.push(goldenHerdScoutParty);
  }
  if (zones.indexOf("steel-rangers-surroundings") >= 0) {
    for (let i = 0 ; i < 3 ; ++i)
      array.push(steelRangerScoutParty);
  }
  if (zones.indexOf("crystal-den-surroundings") >= 0) {
    for (let i = 0 ; i < 2 ; ++i)
       array.push(crystalDenScoutParty);
  }
  console.log("RANDOM ENCOUNTERS CURRENT ZONES", zones);
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

  try {
    appendHostileParty(parties);
    if (getValueFromRange(0, 10) > 8)
      appendHostileParty(parties);
    for (let i = 0 ; i < parties.length ; ++i)
      parties[i].zone = `encounter-zone-${i + 1}`;
  } catch (err) {
    console.log("generateHostileEncounter crashed:", err);
  }
  return parties;
}
