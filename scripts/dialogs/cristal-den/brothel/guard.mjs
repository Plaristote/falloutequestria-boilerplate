export default class Dialog {
  constructor(dialog) {
    this.dialog = dialog;
  }

  get guards() {
    return [level.findObject("brothel.staff#1"), level.findObject("brothel.staff#2")];
  }

  get alcoholicBeverages() {
    const result = [];
    for (let i = 0 ; i < game.player.inventory.items.length && i <= this.alcoholicBeveragesMinCount ; ++i) {
      let item = game.player.inventory.items[i];
      if (item?.script?.alcoholic === true) {
        result.push(item);
      }
    }
    return result;
  }

  onDistractedWithAlcohol() {
    // TODO implement alcohol poisonning death
    this.alcoholicBeverages.forEach(item => {
      game.player.inventory.removeItem(item);
      this.guards.forEach(guard => {
        guard.addBuff("drunk");
      });
    });
    this.onDistracted();
  }

  onDistractedWithBribe() {
    let bribe = this.bribeAmount;
    if (this.dialog.previousState == "goose-chase-negociated")
      bribe = this.negociatedBribeAmount;
    game.player.inventory.removeItemOfType("bottlecaps", bribe);
    this.guards.forEach(guard => {
      guard.inventory.addItemOfType("bottlecaps", bribe / this.guards.length);
    });
    this.onDistracted();
  }

  onDistracted() {
    game.quests.getQuest("cristal-den/pimp-changeling").completeObjective("distractGuards");
    this.guards.forEach(guard => {
      guard.script.startDistraction();
    });
  }

  waitForOfficeHour() {
    game.asyncAdvanceToHour(11, 2);
  }

  get needsToWaitForOfficeHour() {
    return game.timeManager.secondsUntilTime({ hour: 18 }) > (7 * 60 * 60);
  }

  get alcoholicBeveragesMinCount() {
    return 3;
  }

  get canDistractWithAlcohol() {
    return !this.needsToWaitForOfficeHour && this.alcoholicBeverages.length >= this.alcoholicBeveragesMinCount;
  }

  get canDistractWithBribe() {
    return !this.needsToWaitForOfficeHour && game.player.inventory.count("bottlecaps") > 1;
  }

  get canDistractWithLie() {
    return !this.needsToWaitForOfficeHour && game.player.statistics.speech > 65;
  }

  get canAffordBribe() {
    const bribe = this.dialog.stateReference == "goose-chase-negociated"
      ? this.negociatedBribeAmount
      : this.bribeAmount;
    return game.player.inventory.count("bottlecaps") >= bribe;
  }

  get canNegociateBribe() {
    return game.player.statistics.barter >= 40 && game.player.inventory.count("bottlecaps") >= this.negociatedBribeAmount;
  }

  get bribeAmount() {
    return 700;
  }

  get negociatedBribeAmount() {
    const barter = game.player.statistics.barter;
    if (barter >= 120)
      return 50;
    else if (barter >= 95)
      return 100;
    else if (barter >= 80)
      return 200;
    else if (barter >= 50)
      return 400;
    else if (barter >= 40)
      return 600;
    return this.bribeAmount;
  }
}
