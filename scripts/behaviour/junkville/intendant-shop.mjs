import {Shop} from "../shop.mjs";

export default class extends Shop {
  get shopDoors() {
    return [this.model.findObject("door-entrance")];
  }

  openShopRoutine() {
    super.openShopRoutine();
    //if (this.isShopOwnerConscious())
    //  this.shopOwner.script.goToWork();
  }

  closeShopRoutine() {
    super.closeShopRoutine();
    //if (this.isShopOwnerConscious())
    //  this.shopOwner.script.goToSleep();
  }
}
