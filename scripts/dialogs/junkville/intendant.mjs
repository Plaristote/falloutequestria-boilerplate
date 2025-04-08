import {DialogHelper} from "../helpers.mjs";
import {requireQuest} from "../../quests/helpers.mjs";
import {
  hasFoundDisappearedPonies,
} from "../../quests/junkvilleDumpsDisappeared.mjs";

class Dialog extends DialogHelper {
  constructor(dialog) {
    super(dialog);
    this.shop.script.initializeBarterController(this.dialog.barter);
  }

  get shop() {
    return this.dialog.npc.script.shop;
  }
  
  getEntryPoint() {
    if (!this.dialog.npc.hasVariable("met")) {
      this.dialog.npc.setVariable("met", true);
      return "introduction";
    }
    return "entry";
  }

  entry() {
    if (!this.dialog.npc.hasVariable("knowsName"))
      return this.dialog.t("entry", { name: this.dialog.t("customer") });
  }

  learnPlayerName() {
    this.dialog.npc.setVariable("knowsName", true);
  }
  
  learnAboutLeader() {
    if (game.hasVariable("junkvilleCookDied"))
      return this.dialog.t("about-leader-dead");
    level.setVariable("intendantToldAboutLeader", true);
  }

  // BEGIN SCAVENGERS
  get scavengerQuest() { return game.quests.getQuest("junkvilleDumpsDisappeared"); }

  canWarnAboutMissingScavengers() {
    return hasFoundDisappearedPonies() && !this.scavengerQuest.hasVariable("reportedScavengerFound");
  }

  reportMissingScavengers() {
    //this.scavengerQuest.setVariable("reportedScavengerFound", 1);
  }

  isLookingForScavengerRansom() {
    return this.scavengerQuest?.script?.ransomActive
      && !(this.scavengerQuest?.hasVariable("ransomGivenToPlayer"));
  }

  cookApprovedScavengerRansom() {

  }

  scavengerCanProvideRansom() {
    const inventory = level.findObject("store.shelf").inventory;
    return this.scavengerQuest.script.canInventoryProvideRequiredSupplies(inventory);
  }

  scavengerAcceptRansom() {
    const inventorySource = level.findObject("store.shelf").inventory;
    const inventoryTarget = game.player.inventory;

    this.scavengerQuest.script.transferRequiredSupplies(inventorySource, inventoryTarget);
    this.scavengerQuest.setVariable("ransomGivenToPlayer", 1);
  }

  scavengerCheckRansomAvailability() {
    if (!this.scavengerCanProvideRansom()) return "scavengers/cannot-accept-ransom";
  }

  scavengerCanNegociateInsist() {
    return game.player.statistics.speech >= 70;
  }
  // END SCAVENGERS
}

export function create(dialog) {
  return new Dialog(dialog);
}
