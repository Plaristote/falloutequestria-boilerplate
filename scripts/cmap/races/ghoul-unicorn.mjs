import * as Pony from "./earth-pony.mjs";

export const faces = ["ghoul-mare-basic"];

export const isPlayable  = Pony.isPlayable;

export const withFaceColor = Pony.withFaceColor;

export function spriteSheet(model) {
  const pony = Pony.spriteSheet(model);

  pony.base       = "ghoul";
  pony.staticBase = "ghoul-eyes";
  pony.overlay    = "unicorn";
  return pony;
}

export const itemSlots = Pony.itemSlots;

export const getDefaultItem = Pony.getDefaultItem;

export const ageRange = { lifespan: 999 };
