import {DialogHelper} from "./helpers.mjs";

export class MerchantHelper extends DialogHelper {
  constructor(dialog) {
    super(dialog);
    if (this.shop)
      this.shop.script.initializeBarterController(this.dialog.barter);
  }

  get shop() {
    return this.dialog.npc.script?.shop;
  }

  canBuy(price) {
    return this.dialog.player.inventory.count("bottlecaps") >= price;
  }

  spendMoney(price) {
    this.dialog.player.inventory.removeItemOfType("bottlecaps", price);
  }
}
