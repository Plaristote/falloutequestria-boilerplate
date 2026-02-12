import DialogHelper from "../merchant.mjs";
import {drunkenQuestDoctorBagNeeded} from "../../quests/hillburrow/saveDrunkenMaster.mjs";
import {skillContest} from "../../cmap/helpers/checks.mjs";

class Dialog extends DialogHelper {
  canSaveDrunkenMaster() {
    return drunkenQuestDoctorBagNeeded();
  }

  canPayDoctorsBag() {
    return game.player.inventory.count("bottlecaps") > this.doctorBagCost;
  }

  get doctorBagCost() {
    console.log("doctorBagCost getter called");
    if (this.dialog.npc.getVariable("lowered-doctor-bag-price") == 1)
      return 150;
    return 200;
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
}

export function create(dialog) {
  return new Dialog(dialog);
}
