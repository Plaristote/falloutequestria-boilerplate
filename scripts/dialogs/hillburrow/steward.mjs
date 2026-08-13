import DialogHelper from "../merchant.mjs";
import {drunkenQuestDoctorBagNeeded} from "../../quests/hillburrow/saveDrunkenMaster.mjs";
import {isPlayerLookingForWaterCarrier} from "../../quests/cristal-den/bibins-sabotage-delivery.mjs";
import {skillContest} from "../../cmap/helpers/checks.mjs";

class Dialog extends DialogHelper {
  canAskAboutWaterCarrier() {
    return isPlayerLookingForWaterCarrier();
  }

  canSaveDrunkenMaster() {
    return drunkenQuestDoctorBagNeeded();
  }

  canPayDoctorsBag() {
    return game.player.inventory.count("bottlecaps") > this.doctorBagCost;
  }

  get doctorBagCost() {
    if (this.dialog.npc.getVariable("lowered-doctor-bag-price") == 1)
      return 90;
    return 180;
  }

  onBuyDoctorsBag() {
    game.player.inventory.removeItemOfType("bottlecaps", this.doctorBagCost);
    game.player.inventory.addItemOfType("doctor-bag");
    return null;
  }

  canNegociateDoctorsBagPrice() {
    return !this.dialog.npc.hasVariable("lowered-doctor-bag-price");
  }

  onNegociateDoctorsBagPrice() {
    if (skillContest(game.player, this.dialog.npc, "barter") === game.player) {
      this.dialog.npc.setVariable("lowered-doctor-bag-price", 1);
      return "drunken-quest-on-negociate-success";
    }
    return "drunken-quest-on-negociate-failure";
  }

  onStartNegotiateDoctorBag() {
    if (game.hasVariable("potiokBittyDead"))
      return "drunken-quest-on-negociate-success";
    return "drunken-quest-on-negociate";
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
