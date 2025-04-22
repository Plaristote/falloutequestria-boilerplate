import {getValueFromRange} from "../behaviour/random.mjs";

function availableLevels() {
  return ["random-desert-1", "random-desert-2", "random-desert-cabin"];
}

export function generateEncounterLevel() {
  const candidateMaps = availableLevels();
  const mapRoll       = getValueFromRange(0, candidateMaps.length - 1);
  return candidateMaps[mapRoll];
}
