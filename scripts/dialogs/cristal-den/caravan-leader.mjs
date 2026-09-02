import ThornhoofCaravanComponent from "./thornhoof-caravan-leader.mjs";

class Dialog extends ThornhoofCaravanComponent {
  constructor(dialog) {
    super(dialog);
    this.dialog = dialog;
  }

  getEntryPoint() {
    if (this.thornhoofCaravanShouldOvertakeEntryPoint())
      return "thornhoof-caravan/waiting-to-go";
    else if (this.canJoinCaravanOnTheWayBack())
      return "way-back";
    else if (this.pendingReward > 0 || game.hasVariable("abandonnedCaravan") || game.hasVariable("wipedOutCaravan"))
      return "reward";
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
  }

  startExpedition() {
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
}

export function create(dialog) {
  return new Dialog(dialog);
}
