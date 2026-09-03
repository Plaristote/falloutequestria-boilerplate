import ThornhoofCaravanComponent from "./thornhoof-caravan-leader.mjs";

class Dialog extends ThornhoofCaravanComponent {
  constructor(dialog) {
    super(dialog);
    this.dialog = dialog;
  }

  getEntryPoint() {
    if (this.thornhoofCaravanShouldOvertakeEntryPoint())
      return "thornhoof-caravan/waiting-to-go";
    else if (game.script.ghoulHunterExpedition.inProgress) {
      if (this.hasPendingExpeditionDebrief())
        return "expedition-debrief";
      return "expedition-in-progress";
    }
    else if (this.canJoinCaravanOnTheWayBack())
      return "way-back";
    else if (this.pendingReward > 0 || game.hasVariable("abandonnedCaravan") || game.hasVariable("wipedOutCaravan"))
      return "reward";
    else if (this.pendingExpeditionReward > 0 || game.hasVariable("abandonnedExpedition") || game.hasVariable("wipedOutExpedition"))
      return "expedition-reward";
    return "entry";
  }

  get nextCaravanDestination() {
    return this.dialog.npc.script.nextCaravanDestination;
  }

  canJoinCaravanOnTheWayBack() {
    return typeof level !== "undefined" && level.name !== "cristal-den-entrance";
  }

  canJoinCaravan() {
    return game.getVariable("fargo-caravan-on", 0) == 1;
  }

  onJoinCaravan() {
    if (game.script.caravan.failedCaravanCount > 3)
      return "too-many-failures";
    return game.timeManager.weekDay == 1 ? "join-caravan" : "caravan-later";
  }

  startCaravan() {
    this.dialog.npc.tasks.addTask("startCaravan", 350, 1);
  }

  onAskedAboutCaravan() {
    game.setVariable("knowsLaurieIsCaravaneer", 1);
  }

  knowsLaurieIsCaravaneer() {
    return game.getVariable("knowsLaurieIsCaravaneer", 0) == 1;
  }

  getCelestialDeviceQuest() {
    return game.quests.getQuest("celestialDevice");
  }

  isLookingForArmModule() {
    const quest = this.getCelestialDeviceQuest();
    return !!(quest && quest.hasObjective("find-arm-module"));
  }

  hasUnresolvedCelestialDeviceLead() {
    const quest = this.getCelestialDeviceQuest();
    return !!(quest && !quest.isObjectiveCompleted("find-arm-module"));
  }

  canAskAboutCelestialDevice() {
    return this.knowsLaurieIsCaravaneer()
      && this.hasUnresolvedCelestialDeviceLead()
      && !this.isLookingForArmModule();
  }

  canAskAboutArmModule() {
    return this.knowsLaurieIsCaravaneer()
      && this.hasUnresolvedCelestialDeviceLead()
      && this.isLookingForArmModule();
  }

  onAskJoinCaravanToSteelRangers() {
    if (!this.canJoinCaravan())
      return "steel-rangers-need-caravaneer";
    this.dialog.npc.script.nextCaravanDestination = "steel-rangers-bunker";
    return game.timeManager.weekDay == 1 ? "join-caravan" : "caravan-later";
  }

  canJoinExpedition() {
    return game.getVariable("fargo-ghoul-hunter-on", 0) == 1;
  }

  onJoinExpedition() {
    if (game.script.ghoulHunterExpedition.failedExpeditionCount > 3)
      return "too-many-expedition-failures";
    return "join-expedition";
  }

  // TODO: confirm which day(s) expeditions actually depart on.
  canStartExpeditionToday() {
    return game.timeManager.weekDay == 4;
  }

  daysUntilNextExpedition() {
    const weekDay = game.timeManager.weekDay;
    const days = (4 - weekDay + 7) % 7;
    return days === 0 ? 7 : days;
  }

  onEnterJoinExpedition() {
    if (!this.canStartExpeditionToday())
      return { text: this.dialog.tr("join-expedition-wrong-day", { daysUntil: this.daysUntilNextExpedition() }), mood: "dubious" };
  }

  startExpedition() {
    this.dialog.npc.tasks.addTask("startGhoulHunterExpedition", 350, 1);
  }

  // --- Mid-expedition check-in (locked branch while inProgress) ---

  expeditionMoraleTier() {
    return game.script.ghoulHunterExpedition.moraleTier;
  }

  onEnterExpeditionInProgress() {
    const moods = { confident: "smile", doubtful: "dubious", grim: "sad" };
    const tier = this.expeditionMoraleTier();

    return { text: this.dialog.tr(`expedition-in-progress-${tier}`), mood: moods[tier] };
  }

  canRetreatFromExpedition() {
    return this.expeditionMoraleTier() === "grim";
  }

  continueExpedition() {
    game.exitLevel(function() {});
  }

  campBeforeContinuing() {
    // TODO: hook this up to whatever rest/heal mechanic the party actually
    // has (not shown in the files I have) - this currently just advances to
    // the next step without healing anyone.
    game.exitLevel(function() {});
  }

  retreatFromExpedition() {
    game.script.ghoulHunterExpedition.abortExpedition();
  }

  // --- Post-expedition debrief (shadow pony reveal) ---

  hasPendingExpeditionDebrief() {
    return game.hasVariable("expeditionDebriefPending");
  }

  // TODO: confirm actual perception threshold/scale for this check.
  canNoticeGhoulsFledFromShadowPony() {
    return game.player.statistics.perception >= 6;
  }

  startGhoulExpeditionQuestForReal() {
    game.unsetVariable("expeditionDebriefPending");
    if (!game.quests.getQuest("cristal-den/ghoulExpedition"))
      game.quests.addQuest("cristal-den/ghoulExpedition");
  }

  // --- Reporting the threat as dealt with ---

  canReportGhoulThreatResolved() {
    const quest = game.quests.getQuest("cristal-den/ghoulExpedition");

    return !!(quest && quest.completed) && !game.hasVariable("toldLaurieGhoulThreatResolved");
  }

  onReportGhoulThreatResolved() {
    game.setVariable("toldLaurieGhoulThreatResolved", 1);
    // TODO: confirm the intended reputation amount - matched the precedent
    // value used in celestialDevice.mjs's game.dataEngine.addReputation call.
    game.dataEngine.addReputation("cristal-den", 150);
    const quest = game.quests.getQuest("cristal-den/ghoulExpedition");
    if (quest && !quest.isObjectiveCompleted("report-to-laurie"))
      quest.completeObjective("report-to-laurie");
  }

  get pendingReward() {
    return game.script.caravan.pendingReward;
  }

  set pendingReward(value) {
    game.script.caravan.pendingReward = value;
  }

  giveReward() {
    const abandonnedCaravan = game.hasVariable("abandonnedCaravan");
    const wipedOutCaravan = game.hasVariable("wipedOutCaravan");
    let rewarded = this.pendingReward;

    this.pendingReward = 0;
    if (rewarded > 0 && !wipedOutCaravan)
      game.player.inventory.addItemOfType("bottlecaps", rewarded);
    game.unsetVariables(["abandonnedCaravan", "wipedOutCaravan"]);
    if (abandonnedCaravan) {
      if (rewarded > 0)
        return { text: this.dialog.tr("ranawayReward", { pendingReward: rewarded }), mood: "dubious" };
      else
        return { text: this.dialog.tr("ranaway"), mood: "angry" };
    } else if (wipedOutCaravan) {
      return { text: this.dialog.tr("wipedout"), mood: "sad" };
    }
    return this.dialog.tr("reward", { pendingReward: rewarded });
  }

  get pendingExpeditionReward() {
    return game.script.ghoulHunterExpedition.pendingReward;
  }

  set pendingExpeditionReward(value) {
    game.script.ghoulHunterExpedition.pendingReward = value;
  }

  giveExpeditionReward() {
    const abandonnedExpedition = game.hasVariable("abandonnedExpedition");
    const wipedOutExpedition = game.hasVariable("wipedOutExpedition");
    let rewarded = this.pendingExpeditionReward;

    this.pendingExpeditionReward = 0;
    if (rewarded > 0 && !wipedOutExpedition)
      game.player.inventory.addItemOfType("bottlecaps", rewarded);
    game.unsetVariables(["abandonnedExpedition", "wipedOutExpedition"]);
    if (abandonnedExpedition) {
      if (rewarded > 0)
        return { text: this.dialog.tr("expedition-ranawayReward", { pendingReward: rewarded }), mood: "dubious" };
      else
        return { text: this.dialog.tr("expedition-ranaway"), mood: "angry" };
    } else if (wipedOutExpedition) {
      return { text: this.dialog.tr("expedition-wipedout"), mood: "sad" };
    }
    return this.dialog.tr("expedition-reward", { pendingReward: rewarded });
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
