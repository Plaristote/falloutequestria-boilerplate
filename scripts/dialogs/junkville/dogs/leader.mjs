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
import {
  banditsDefeatedWithJunkvilleHelp,
  sendDogReinforcement
} from "../../../quests/junkville/cavernBandits.mjs";
import {skillCheck, skillContest} from "../../../cmap/helpers/checks.mjs";

export default class Dialog {
  constructor(dialog) {
    this.dialog = dialog;
    this.dialog.ambiance = "cavern";
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
    this.firstContactLock = true;
    return "first-contact/entry";
  }

  //
  // BEGIN SCAVENGER QUEST
  //
  get scavengerQuest() { return game.quests.getQuest("junkvilleDumpsDisappeared"); }

  get scavengerHealedWoundedDogs() { return this.scavengerQuest?.isObjectiveCompleted("healWoundedDogs"); }

  hasScavengerQuest() {
    return game.quests.hasQuest("junkvilleDumpsDisappeared");
  }

  canAskAboutScavengers() {
    return this.hasScavengerQuest() && !this.scavengerQuest.script.ransomActive;
  }

  knowsAboutDisappearedScavengers() {
    return hasFoundDisappearedPonies();
  }

  intimidateIntoFreeingScavengers() {
    const strongestAlly = game.playerParty.mostSkilledAt("strength");

    game.dataEngine.addReputation("diamond-dogs", -50);
    if (strongestAlly.statistics.strength >= 8 && game.player.statistics.level >= 4)
    {
      const success = skillContest(game.player, this.dialog.npc, "charisma", 3)
                   && skillContest(game.player, this.dialog.npc, "speech", 50);
      if (success) {
        authorizeCaptiveRelease();
        skipScavengerRansom();
        return "scavengers/intimidation-success";
      }
    }
    return "scavengers/intimidation-failure";
  }

  woundedDogsTopic() {
    if (!hasFoundDisappearedPonies()) return "scavengers/wounded-intro";
    if (this.canAskAboutWoundedDogs) return "bandits/intro";
    return "scavengers/about";
  }

  get canAskAboutWoundedDogs() {
    return this.dialog.npc.getVariable("canAskAboutWoundedDogs", 0) == 1
        && this.scavengerHealedWoundedDogs
        && (!this.banditsQuest || !this.banditsQuest.script.talkedWithDogs);
  }

  scavengerAbout() {
    console.log("scavengerAbout", "What is previous answer", this.dialog.previousAnswer);
    if (!isLookingForDisappearedPonies()) startLookingForDisappearedPonies();
    if (!hasFoundDisappearedPonies()) onDisappearedPoniesFound();
    this.dialog.npc.setVariable("canAskAboutWoundedDogs", 1);
    switch (this.dialog.previousAnswer) {
      case "wounded-intro-tell-me-more": return { textKey: "scavengers/about-from-wounded" };
      case "leave":                      return { textKey: "scavengers/introduction" };
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

  scavengerReleaseAttempt() {
    const success = skillCheck(game.player, "speech", 85);
    if (success) return "scavengers/convince-success";
    return "scavengers/release-refused";
  }

  scavengerConvincedToRelease() {
    authorizeCaptiveRelease();
    enableScavengerRansom("alt");
  }

  scavengerWoundedHealed() {
    authorizeCaptiveRelease();
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
      this.entryTextOverload = altState;
    else
      this.entryTextOverload = "scavengers/on-ransom-received-scavengers-already-freed";
    return "entry";
  }

  entry() {
    const overload = this.entryTextOverload;
    const mood = this.entryMoodOverload;

    this.entryTextOverload = null;
    this.entryMoodOverload = null;
    if (overload)
      return { textKey: overload, mood: mood || undefined };
  }

  exitAboutDogs() {
    console.log("exitAboutDogs, scavengerLock=", this.scavengerLock);
    if (this.firstContactLock)
      return "first-contact/why-here";
    if (this.scavengerLock)
      return "scavengers/introduction";
    console.log("exitAboutDogs, no scavengerLock");
  }

  //
  // BEGIN FIRST CONTACT
  //
  firstContactPersuade() {
    const success = skillCheck(game.player, "speech", 75);
    if (success) {
      this.firstContactLock = false;
      this.entryTextOverload = "neutral-ground";
      this.entryMoodOverload = "neutral";
      return "entry";
    }
    return "first-contact/distrust";
  }

  firstContactWhyHere() {
    if (this.dialog.previousAnswer === "about-back-to-entry")
      return { textKey: "first-contact/why-here-reentry" };
    return { textKey: "first-contact/why-here" };
  }

  firstContactGoToQuest() {
    console.log("Swapping to scavengerLock");
    this.firstContactLock = false;
    this.scavengerLock = true;
  }

  tryToLeave() {
    return this.firstMeeting ? "first-contact/on-exit-attempt" : "";
  }

  tryToLeaveAlt() {
    return this.firstMeeting ? "first-contact/on-exit-attempt-alt" : "";
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
      case "push-to-hide-dolly": return { textKey: "negociations/why-dolly-hide", mood: "angry" };
      case "push-to-hide-wait":
      case "negociation-suggest-waiting": return { textKey: "negociations/why-not-wait", mood: "cocky" };
      case "negociation-why-me": return { textKey: "negociations/why-player", mood: "smile" };
    }
  }

  negociateClarified() {
    console.log("Negociate clarified ?", this._negociateClarified);
    return this._negociateClarified;
  }

  negociateClarifications() {
    this._negociateClarified = true;
  }

  negociateCanConvinceDogs() {
    return skillCheck(game.player, "speech", 75) || banditsDefeatedWithJunkvilleHelp();
  }

  negociateAttemptAccept() {
    if (!this.negociateCanConvinceDogs()) {
      this.dialog.npc.setVariable("negociateWaryToldOnce", 1);
      return "negociations/wary-refusal";
    }
    return "negociations/on-accepted";
  }

  negociateOnAcceptedText() {
    return banditsDefeatedWithJunkvilleHelp() ?
      "negociations/on-accepted-bandits" : "negociations/on-accepted";
  }

  negociateOnAccepted() {
    startMediation();
  }

  negociateCanPassOnJunkvilleDecision() {
    return this.negociateQuest.hasVariable("passOnJunkvilleDecision")
       && !this.negociateQuest.isObjectiveCompleted("pass-on-assembly-decision");
  }

  negociatePassOnJunkvilleDecisionText() {
    switch (this.negociateQuest.getVariable("junkvilleDecision")) {
      case "accept": return this.dialog.t("pass-on-junkville-decision-accept");
      case "reject": return this.dialog.t("pass-on-junkville-decision-reject");
    }
    return "<i>SCRIPT ERROR</i>";
  }

  negociateOnJunkvilleDecision() {
    this.negociateQuest.setVariable("passOnJunkvilleDecision", 2);
    this.negociateQuest.completeObjective("peaceful-resolve");
    switch (this.negociateQuest.getVariable("junkvilleDecision")) {
      case "accept":
        this.dialog.mood = "smile";
        return this.dialog.t("negociations/on-junkville-accept");
      case "reject":
        this.dialog.mood = "sad";
        return this.dialog.t("negociations/on-junkville-reject");
    }
    return "<i>SCRIPT ERROR</i>";
  }

  negociationsKnowAboutDollyOpinion() {
    return this.negociateQuest.hasVariable("knowAboutDollyOpinion");
  }

  // BEGIN SPINEL QUEST
  canAskAboutSpinel() {
    const quest = game.quests.getQuest("capital/find-spinel");
    return quest && !quest.isObjectiveCompleted("find-spinel");
  }

  onSpinelAsked() {
    if (game.dataEngine.getReputation("diamond-dogs") < 100)
      return "spinel/not-liked-enough";
  }

  onGiveSpinel() {
    const chest = level.findObject("chest");
    const quest = game.quests.getQuest("capital/find-spinel");
    chest.toggleSneaking(false);
    chest.inventory.removeItemOfType("electromagic-spinel");
    game.player.inventory.addItemOfType("electromagic-spinel");
    quest.completeObjective("find-spinel");
  }

  //
  // BEGIN BANDITS QUEST
  //
  get banditsQuest() { return game.quests.getQuest("junkville/cavernBandits"); }

  banditsQuestAccepted() {
    let quest = game.quests.getQuest("junkville/cavernBandits");
    if (!quest) {
      // Nobody told the player about this yet - Fido is the first to bring
      // it up, so he's the one credited with handing out the quest.
      quest = game.quests.addQuest("junkville/cavernBandits");
      quest.script.pushUniqueEvent("given-by-dogs");
    } else {
      // Randy may already have sent the player looking for the bandits'
      // camp. Either way, the player now has the full story from Fido.
      quest.script.pushUniqueEvent("talked-with-dogs");
    }
    return "bandits/tell-about-location";
  }

  banditsCanSuggestCollapse() {
    return game.player.statistics.science > 45 || game.player.statistics.explosives > 40;
  }

  banditsBarterReward() {
    const success = skillCheck(game.player, "barter", 60);
    if (success) {
      return "bandits/barter-success";
    }
    return "bandits/barter-failure";
  }

  banditsConvinceToHelp() {
    const success = skillContest(game.player, this.dialog.npc, "speech", 65);
    if (success) {
      sendDogReinforcement();
      return "bandits/reinforce-success";
    }
    return "bandits/reinforce-failure";
  }

  banditsCanReportResolution() {
    const quest = game.quests.getQuest("junkville/cavernBandits");
    return quest && quest.isObjectiveCompleted("remove-bandits") && !quest.isObjectiveCompleted("reported-to-leader");
  }

  banditsReportResolution() {
    const quest = game.quests.getQuest("junkville/cavernBandits");
    const resolution = quest.getVariable("raidersResolution");

    quest.completeObjective("reported-to-leader");

    if (resolution === "player-solo") {
      return "bandits/report-solo";
    } else if (resolution === "junkville-help") {
      return "bandits/report-junkville";
    } else if (resolution === "dogs-help") {
      return "bandits/report-dogs";
    }
    return "entry"; // Fallback
  }
}
