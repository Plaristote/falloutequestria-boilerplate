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
    // Cannot accept ransom anyway
    if (!this.scavengerCanProvideRansom()) return "scavengers/cannot-accept-ransom";

    // Cannot trade ransom for the sub-quest, since sub-quest is already completed
    if (game.quests.getQuest("junkville/getRathianParts")?.completed == true) return "scavengers/accept-ransom";
  }

  scavengerCanNegociateInsist() {
    return game.player.statistics.speech >= 70;
  }

  startGetRathianPartsAsScavengerSubquest() {
    game.quests.addQuest("junkville/getRathianParts");
  }
  // END SCAVENGERS

  canGiveRathianParts() {
    const quest = game.quests.getQuest("junkville/getRathianParts");
    return quest
        && !quest.hidden
        && game.player.inventory.count("quest-rathian-computer-parts") > 0
        && !quest.isObjectiveCompleted("giveParts");
  }

  giveRathianParts() {
    game.player.inventory.removeItemOfType("quest-rathian-computer-parts");
    this.dialog.npc.inventory.addItemOfType("quest-rathian-computer-parts");
    game.quests.getQuest("junkville/getRathianParts").completeObjective("giveParts");
  }

  rathianPartsOnAskScavengerRansom() {
    if (!this.scavengerCanProvideRansom())
      return "scavengers/cannot-accept-ransom";
  }

  startGetRathianPartsAsStandaloneQuest() {
    const quest = game.quests.addQuest("junkville/getRathianParts");
    quest.setVariable("withDiscount", 1);
  }

  shouldOfferRathianPartsQuest() {
    return !game.quests.hasQuest("junkville/getRathianParts")
        && game.dataEngine.getReputation("junkville") > 50;
  }

  onExit() {
    if (this.shouldOfferRathianPartsQuest())
      return "rathian-parts-quest";
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
