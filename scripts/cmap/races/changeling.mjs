import * as Pony from "./earth-pony.mjs";
import * as EarthPony from "./earth-pony.mjs";
import * as Unicorn from "./unicorn.mjs";
import * as Pegasus from "./pegasus.mjs";

export const faces = ["changeling"];

function makeSpriteSheet(race, params) {
  switch (race) {
  case "earth-pony": return EarthPony.spriteSheet(params);
  case "unicorn": return Unicorn.spriteSheet(params);
  case "pegasus": return Pegasus.spriteSheet(params);
  }
  return "changeling-evil";
}

export function spriteSheet(model) {
  try {
    if (model.variables.transformed) {
      return makeSpriteSheet(
        model.variables.transformRace,
        JSON.parse(model.variables.transformParams)
      );
    }
  } catch (err) {
    console.error("failed to load changeling spritesheet", err);
  }
  return "changeling-evil";
}

export const itemSlots = {
  "armor": "armor",
  "use-1": "any",
  "use-2": "any"
};

export function getDefaultItem(model, slot) {
  return Pony.getDefaultItem(model, slot);
}

export function onToggled(statistics, toggled) {
  let modifier = toggled ? 1 : -1;

  statistics.charisma += 1 * modifier;
  statistics.strength += -1 * modifier;
}

export function modifyBaseSkill(characterSheet, name, value) {
  switch (name) {
  case "stealth":
    return value + 25;
  }
  return value;
}
