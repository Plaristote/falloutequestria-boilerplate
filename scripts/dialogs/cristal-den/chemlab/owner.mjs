import {MerchantHelper} from "../../merchant.mjs";

export default class extends MerchantHelper {
  constructor(dialog) {
    super(dialog);
  }

  canAskBidShipment() {
    return game.hasVariable("armorBidErrandEnabled");
  }

  pickUpBidShipment() {
    game.unsetVariable("armorBidErrandEnabled");
    game.player.inventory.addItemOfType("armor-bid-shipment");
  }
}
