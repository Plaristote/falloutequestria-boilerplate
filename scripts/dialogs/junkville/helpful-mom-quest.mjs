import {requireQuest} from "../../quests/helpers.mjs";
import {teleportToCaverns} from "../../quests/junkville/findHelpful.mjs"
import {allowedInCaverns} from "../../quests/junkvilleNegociateWithDogs.mjs";

function getQuest() { return requireQuest("junkville/findHelpful"); }

class Dialog {
  constructor(dialog) {
    this.dialog = dialog;
    game.loadingScreenBackground = "helpful_copain";
  }

  getEntryPoint() {
    if (game.quests.hasQuest("junkville/findHelpful") && getQuest().isObjectiveCompleted("save-helpful"))
      return "quest-success";
    if (this.dialog.npc.hasVariable("quest-talked"))
      return "entry-alt";
    this.dialog.npc.setVariable("quest-talked", 1);
    return "entry";
  }

  nothingSaid() {
    this.dialog.npc.unsetVariable("quest-talked");
  }

  hasQuestFromRandy() {
    const quest = game.quests.getQuest("junkville/findHelpful");
    return quest && quest.getVariable("initBy") == "cook";
  }

  askMorePayment() {
    const success = game.player.statistics.trade >= 82;
    if (!success)
      game.dataEngine.addReputation("junkville", -12);
    return success ? "payment-asked-more-success" : "payment-asked-more-failure";
  }

  onExplain() {
    const quest = getQuest();
    if (!quest.hasVariable("initBy"))
      quest.setVariable("initBy", "mom");
    quest.completeObjective("talk-to-parents");
  }

  acceptedPayment1() {
    getQuest().setVariable("payment", 200)
  }

  acceptedPayment2() {
    getQuest().setVariable("payment", 400);
  }

  askedForPayment() {
    return getQuest().hasVariable("payment");
  }

  hasFoundHelpful() {
    const quest = getQuest();
    return quest.isObjectiveCompleted("find-helpful");
  }

  canGetHelpForHelpful() {
    const quest = getQuest();
    return this.hasFoundHelpful() && !quest.hasVariable("died");
  }

  canConvinceToExplain() {
    return game.player.statistics.speech > 45;
  }

  onDeathReport() {
    const quest = getQuest();
    quest.completeObjective("tell-parents");
  }

  onReportHurt() {
    return allowedInCaverns() ? "going-to-help" : "forbidden-caverns";
  }

  areDogsDead() {
    const quest = game.quests.getQuest("junkvilleNegociateWithDogs");
    return quest && quest.isObjectiveCompleted("win-battle");
  }

  goToCaverns() {
    teleportToCaverns();
  }

  rejectedReward() {
    game.dataEngine.addReputation("junkville", 45);
  }

  givePayment() {
    const payment = getQuest().getVariable("payment");
    game.player.inventory.addItemOfType("bottlecaps", payment);
    return this.dialog.t("give-payment", {reward: payment });
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
