import {getValueFromRange} from "../behaviour/random.mjs";

function availableLevels() {
  const zones = game.worldmap.getCurrentZones();
  let array = [];

  if (zones.indexOf("Mountains#1") + zones.indexOf("Mountains#2") >= -1) {
    // Make some maps for mountains
  } else if (zones.indexOf("forest")) {
    // Make some foresty maps
  }
  return ["random-desert-1", "random-desert-2", "random-desert-cabin"];
}

export function generateEncounterLevel() {
  const candidateMaps = availableLevels();
  const mapRoll       = getValueFromRange(0, candidateMaps.length - 1);
  return candidateMaps[mapRoll];
}
