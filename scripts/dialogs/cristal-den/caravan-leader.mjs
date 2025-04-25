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
    else if (this.pendingReward)
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
    return game.script.caravan.pendingReward > 0;
  }

  giveReward() {
    game.player.inventory.addItemOfType("bottlecaps", game.script.caravan.pendingReward);
    game.script.caravan.pendingReward = 0;
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
