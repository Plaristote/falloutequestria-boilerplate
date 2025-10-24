import {CharacterBehaviour} from "./../../character.mjs";

export default class extends CharacterBehaviour {
  pickUpGunFromCellarShelf() {
    const shelf = level.findObject("dustlock-home.cellar.table");
    const gun = shelf.inventory.getItemOfType("laser-gun");

    this.model.setAsEnemy(game.player);
    if (gun) {
      gun.setVariable("leafStolen", 1);
      shelf.inventory.removeItem(gun);
      this.model.inventory.addItem(gun);
      if (shelf.inventory.removeItemOfType("energy-cell", 8))
        this.model.inventory.addItemOfType("energy-cell", 8);
      shelf.setVariable("refugeesPickedWeapons", 1);
    }
  }
}
