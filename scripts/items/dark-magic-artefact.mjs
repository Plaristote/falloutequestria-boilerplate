import {ItemBehaviour} from "./item.mjs";

function  toggleBuffs(user, active, inactive) {
  const buff = user.getBuff(inactive);

  if (buff) buff.remove();
  user.addBuff(active);
}

export class DarkMagicArtefact extends ItemBehaviour {
  constructor(model) {
    super(model);
  }

  onAddedToInventory(user) {
    toggleBuffs(user, "dark-magic-buff", "dark-magic-sickness");
  }

  onRemovedFromInventory(user) {
    toggleBuffs(user, "dark-magic-sickness", "dark-magic-buff");
  }
}
