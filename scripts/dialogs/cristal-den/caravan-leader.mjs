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
    else if (this.pendingReward > 0 || game.hasVariable("abandonnedCaravan"))
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
    return game.timeManager.weekDay == 1 ? "join-caravan" : "caravan-later";
  }

  startCaravan() {
    this.dialog.npc.tasks.addTask("startCaravan", 350, 1);
  }

  get pendingReward() {
    return game.script.caravan.pendingReward;
  }

  set pendingReward(value) {
    game.script.caravan.pendingReward = value;
  }

  giveReward() {
    const abandonnedCaravan = game.hasVariable("abandonnedCaravan");
    let rewarded = this.pendingReward;

    this.pendingReward = 0;
    if (rewarded > 0)
      game.player.inventory.addItemOfType("bottlecaps", rewarded);
    game.unsetVariable("abandonnedCaravan");
    if (abandonnedCaravan) {
      if (rewarded > 0)
        return { text: this.dialog.tr("ranawayReward", { pendingReward: rewarded }), mood: "dubious" };
      else
        return { text: this.dialog.tr("ranaway"), mood: "angry" };
    }
    return this.dialog.tr("reward", { pendingReward: rewarded });
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
