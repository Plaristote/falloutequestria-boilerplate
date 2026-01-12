import * as Pony from "./earth-pony.mjs";

export const faces = ["mare-basic"];

export const isPlayable = false;

export const withFaceColor = Pony.withFaceColor;

export function spriteSheet(model) {
  const pony = Pony.spriteSheet(model);

  pony.overlay = "alicorn";
  return pony;
}

export const itemSlots = Pony.itemSlots;

export const getDefaultItem = Pony.getDefaultItem;

export function onToggled(statistics, toggled) {
  Pony.onToggled(statistics, toggled);
}

export function modifyBaseSkill(characterSheet, name, value) {
  switch (name) {
  case "spellcasting":
    return value + 15;
  case "outdoorsman":
    return value + 20;
  }
  return value;
}
