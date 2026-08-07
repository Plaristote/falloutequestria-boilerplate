import {
  isLookingForDisappearedPonies,
  startLookingForDisappearedPonies,
  hasFoundDisappearedPonies,
  onDisappearedPoniesFound,
  authorizeCaptiveRelease,
  enableScavengerRansom,
  skipScavengerRansom,
  dogsExpectingSupplies,
  captiveReleaseAuthorized
} from "../../../quests/junkvilleDumpsDisappeared.mjs";
import {
  NEGOTIATE_FIDO_ARGUMENT_FLAGS,
  hasMediationStarted,
  startMediation,
  hasRandyAgreedToNegotiate
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
    return this.hasScavengerQuest()
      && !captiveReleaseAuthorized()
      && !this.scavengerQuest.script.ransomActive;
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

  onCaptiveRansomNotYet() {
    return captiveReleaseAuthorized()
      ? this.dialog.tr("scavengers/on-ransom-not-yet")
      : this.dialog.tr("scavengers/on-ransom-not-yet-freed");
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
    this.scavengerQuest.setVariable("reportedHealedDogs", 1);
    authorizeCaptiveRelease();
  }

  scavengerCanPayRansom() {
    return this.scavengerQuest.script.canInventoryProvideRequiredSupplies(game.player.inventory);
  }

  scavengerOnRansomReceived() {
    this.scavengerQuest.script.transferRequiredSupplies(game.player.inventory, null);
    this.scavengerQuest.script.woundedDogs = 0;
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
    return  this.scavengerHealedWoundedDogs
        &&  this.scavengerQuest?.isObjectiveCompleted("save-captives")
        && !this.negociateQuest?.isObjectiveCompleted("peaceful-resolve");
  }

  negociateHasStartedDebate() {
    return NEGOTIATE_FIDO_ARGUMENT_FLAGS.some(flag => !!this.negociateQuest?.hasVariable(flag));
  }

  negociateDebatePoints() {
    return this.negociateQuest.script.dogsDebatePoints;
  }

  negociateCanArgueHelp() {
    return !this.negociateQuest?.hasVariable("fidoDebateUsedHelp");
  }

  negociateCanArgueBandits() {
    return !this.negociateQuest?.hasVariable("fidoDebateUsedBandits")
        && banditsDefeatedWithJunkvilleHelp();
  }

  negociateCanArgueFuture() {
    return !this.negociateQuest?.hasVariable("fidoDebateUsedFuture");
  }

  negociateOnArgueHelp()    { return this.negociateApplyArgument("fidoDebateUsedHelp", "point-help-made"); }
  negociateOnArgueBandits() { return this.negociateApplyArgument("fidoDebateUsedBandits", "point-bandits-made"); }
  negociateOnArgueFuture()  { return this.negociateApplyArgument("fidoDebateUsedFuture", "point-future-made"); }

  negociateApplyArgument(flag, reactionState) {
    if (!this.negociateQuest || this.negociateQuest.hidden)
      game.quests.addQuest("junkvilleNegociateWithDogs");
    this.negociateQuest.setVariable(flag, true);
    if (this.negociateDebatePoints() >= 2) {
      startMediation();
      level.script.dollyReactsToDogsNegotiating();
      return "negociations/agreed";
    }
    return `negociations/${reactionState}`;
  }

  negociateBringUp() {
    this.dialog.npc.setVariable("negociateBroughtUp", 1);
    if (!hasMediationStarted())
      return "negociations/debate-entry";
    if (!hasRandyAgreedToNegotiate())
      return "negociations/waiting-on-randy";
    if (this.negociateQuest.hasVariable("junkvilleDecision") || this.negociateQuest.isObjectiveCompleted("pass-on-message"))
      return "negociations/entry-alt";
    if (this.negociateQuest.isObjectiveCompleted("fido-accepted-trade") || this.negociateQuest.hasVariable("fidoTradeLocked"))
      return "negociations/trade-resolved";
    return "negociations/trade-entry";
  }

  negociateBringUpText() {
    if (!this.dialog.npc.hasVariable("negociateBroughtUp"))
      return this.dialog.tr("bring-up-negociations-init");
    return this.dialog.tr("bring-up-negociations");
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
    const provenGoodwill = this.scavengerHealedWoundedDogs && banditsDefeatedWithJunkvilleHelp();
    return provenGoodwill || skillCheck(game.player, "speech", 90);
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
    level.getScriptObject().dollyReactsToDogsNegotiating();
  }

  negociateTradeResolvedText() {
    return this.negociateQuest.hasVariable("fidoTradeLocked") ?
      this.dialog.t("negociations/trade-locked-recap") : this.dialog.t("negociations/trade-accepted-recap");
  }

  negociateFidoAcceptTrade() {
    this.negociateQuest.completeObjective("fido-accepted-trade");
    return "negociations/trade-accepted";
  }

  negociateFidoLockTrade() {
    this.negociateQuest.setVariable("fidoTradeLocked", true);
    return "negociations/trade-locked";
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

  //
  // BEGIN SPINEL QUEST
  //
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
      quest = game.quests.addQuest("junkville/cavernBandits");
      quest.script.pushUniqueEvent("given-by-dogs");
    } else {
      quest.script.pushUniqueEvent("talked-with-dogs");
    }
    return "bandits/tell-about-location";
  }

  banditsCanSuggestCollapse() {
    return false;
    //return game.player.statistics.science > 45 || game.player.statistics.explosives > 40;
  }

  banditsCanAskReward() {
    return this.dialog.npc.getVariable("banditsReward") == 1;
  }

  banditsGiveReward() {
    this.dialog.npc.setVariable("banditsReward", 2);
    game.player.inventory.addItemOfType("gemstone", 3);
    game.dataEngine.addReputation("diamond-dogs", -10);
  }

  banditsBarterReward() {
    const success = skillCheck(game.player, "barter", 60);
    if (success) {
      this.dialog.npc.setVariable("banditsReward", 1);
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
    return "entry";
  }
}
