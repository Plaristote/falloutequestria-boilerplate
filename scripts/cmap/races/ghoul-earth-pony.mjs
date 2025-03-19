import * as Pony from "./earth-pony.mjs";

export const isPlayable  = false;

export const withFaceColor = Pony.withFaceColor;

export const faces = ["ghoul-mare-basic"];

export function spriteSheet(model, overlay) {
  const pony = Pony.spriteSheet(model);

  pony.base       = "ghoul";
  pony.staticBase = "ghoul-eyes";
  if (overlay)
    pony.overlay  = "overlay";
  return pony;
}

export const itemSlots = Pony.itemSlots;

export const getDefaultItem = Pony.getDefaultItem;

export const onToggled = Pony.onToggled;

export const modifyBaseStatistic = Pony.modifyBaseStatistic;

export const ageRange = { lifespan: 999 };
