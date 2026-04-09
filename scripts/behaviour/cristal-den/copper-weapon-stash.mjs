import {onBlewWeaponStash} from "../../quests/cristal-den/bibins-enforcers-sabotage.mjs";

export default class {
  constructor(model) {
    this.model = model;
  }

  onDamaged() {
    onBlewWeaponStash();
    this.model.parent.objects
      .filter(object => object.type == "StorageObject")
      .forEach(model => level.deleteObject(model));
  }
}
