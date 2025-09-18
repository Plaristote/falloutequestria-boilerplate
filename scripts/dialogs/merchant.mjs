import {DialogHelper} from "./helpers.mjs";

export function makeOrderChoice(self, item, options) {
  return {
    symbol:        `order-${options.type}-${item.name}`,
    textHook:      options.textHook,
    availableHook: self.canOrderItem.bind(self, item),
    hook:          options.hook.bind(self, item)
  };
}

export default class MerchantHelper extends DialogHelper {
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
