import {
  isLookingForDisappearedPonies,
  startLookingForDisappearedPonies,
  hasFoundDisappearedPonies,
  onDisappearedPoniesFound,
  authorizeCaptiveRelease,
  enableScavengerRansom,
  skipScavengerRansom,
  dogsExpectingSupplies
} from "../../../quests/junkvilleDumpsDisappeared.mjs";
import {
  hasMediationStarted,
  startMediation
} from "../../../quests/junkvilleNegociateWithDogs.mjs";
import {skillCheck} from "../../../cmap/helpers/checks.mjs";

class Dialog {
  constructor(dialog) {
    this.dialog = dialog;
  }

  getEntryPoint() {
    console.log("dog-leader getEntryPoint");
    if (this.dialog.npc.hasVariable("met")) {
      if (dogsExpectingSupplies()) {
        console.log("going to", "scavengers/ransom-entry")
        return "scavengers/ransom-entry";
      }
      else
        console.log("dogs are not expecting supplies");
      return "entry";
    }
    this.dialog.npc.setVariable("met", 1);
    this.firstMeeting = true;
    return "first-meeting";
  }

  //
  // BEGIN SCAVENGER QUEST
  //
  get scavengerQuest() { return game.quests.getQuest("junkvilleDumpsDisappeared"); }

  hasLostScavengerQuest() {
    return isLookingForDisappearedPonies();
  }

  knowsAboutDisappearedScavengers() {
    return hasFoundDisappearedPonies();
  }

  intimidateIntoFreeingScavengers() {
    const strongestAlly = game.characterParty.mostSkilledAt("strength");

    game.dataEngine.addReputation("diamond-dogs", -50);
    if (strongestAlly.statistics.strength >= 8)
    {
      const success = skillContest(game.player, this.dialog.npc, "charisma", 3)
                   || skillContest(game.player, this.dialog.npc, "speech", 50);
      if (success) {
        authorizeCaptiveRelease();
        skipScavengerRansom();
        return "scavengers/intimidation-success";
      }
    }
    return "scavengers/intimidation-failure";
  }

  scavengerCanQuestionCaptivity() {
    return game.player.statistics.speech > 85;
  }

  scavengerConvincedToRelease() {
    authorizeCaptiveRelease();
    enableScavengerRansom("alt");
  }

  scavengerAbout() {
    console.log("scavengerAbout", "What is previous answer", this.dialog.previousAnswer);
    if (!isLookingForDisappearedPonies()) startLookingForDisappearedPonies();
    if (!hasFoundDisappearedPonies()) onDisappearedPoniesFound();
    switch (this.dialog.previousAnswer) {
      case "scavengers-ask-why-captives":  return { textKey: "scavengers/why" };
      case "intimidation-free-scavengers": return { textKey: "scavengers/intimidation-failure" };
      case "leave":                        return { textKey: "scavengers/introduction" };
    }
  }

  scavengerMotives() {
    console.log("scavengerMotives", "What is previous answer", this.dialog.previousAnswer);
    enableScavengerRansom("normal");
    switch (this.dialog.previousAnswer) {
      case "motives-followup": return { textKey: "scavengers/on-motives-followup" }
    }
  }

  scavengerRejectedTrade() {
    game.dataEngine.addReputation("diamond-dogs", -15);
  }

  scavengerCanPayRansom() {
    return this.scavengerQuest.script.canInventoryProvideRequiredSupplies(game.player.inventory);
  }

  scavengerOnRansomReceived() {
    this.scavengerQuest.script.transferRequiredSupplies(game.player.inventory, null);
    this.scavengerQuest.completeObjective("bring-ransom");
    authorizeCaptiveRelease();
  }

  scavengerOnRansomNext() {
    const altState = "scavengers/on-ransom-received-free-scavengers";
    if (this.scavengerQuest.script.ransomActive && this.dialog.previousState != altState)
      return altState;
    return "negociations/entry";
  }

  tryToLeave() {
    return this.firstMeeting ? "scavengers/about" : "";
  }

  sendPlayerToPen() {
    game.dataEngine.addReputation("diamond-dogs", -30);
    game.playerParty.insertIntoZone(level, "pony-pen");
    level.setVariable("player-in-pen", true);
  }

  startCombat() {
    game.dataEngine.addReputation("diamond-dogs", -200);
    this.dialog.npc.setAsEnemy(game.player);
  }

  //
  // BEGIN NEGOCIATE QUEST
  //
  get negociateQuest() { return game.quests.getQuest("junkvilleNegociateWithDogs"); }

  negociateCanBringUp() {
    return  this.negociateQuest
        &&  this.negociateQuest.isObjectiveCompleted("bring-medical-supplies")
        && !this.negociateQuest.isObjectiveCompleted("peaceful-resolve");
  }

  negociateBringUp() {
    return hasMediationStarted() ? "negociations/entry-alt" : "negociations/entry";
  }

  negociateEntry() {
    switch (this.dialog.previousAnswer) {
      case "push-to-hide-dolly": return { textKey: "negociate/why-dolly-hide", mood: "angry" };
      case "push-to-hide-wait":
      case "negociation-suggest-waiting": return { textKey: "negociate/why-not-wait", mood: "cocky" };
      case "negociation-why-me": return { textKey: "negociate/why-player", mood: "smile" };
    }
  }

  negociateClarified() {
    console.log("Negociate clarified ?", this._negociateClarified);
    return this._negociateClarified;
  }

  negociateClarifications() {
    this._negociateClarified = true;
  }

  negociateOnAccepted() {
    startMediation();
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
