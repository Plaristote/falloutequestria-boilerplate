export default class Dialog {
  constructor(dialog) {
    this.dialog = dialog;
  }

  get otherGuardName() {
    return level.findObject("guards.dural").statistics.name;
  }

  get canAskThornhoofShipment() {
    return game.quests.hasQuest("thornhoof/caravan") &&
           game.quests.getQuest("thornhoof/caravan").script.caravanInProgress &&
           !game.quests.getQuest("thornhoof/caravan").isObjectiveCompleted("steel-rangers-shipment");
  }

  get canGiveHoarfrostHolodisk() {
    return game.player.inventory.count("quest-holodisk-hoarfrost") > 0;
  }

  waitForThornhoofShipment() {
    game.player.inventory.removeItemOfType("quest-holodisk-hoarfrost");
    game.asyncAdvanceTime(15, function() {
      game.quests.getQuest("thornhoof/caravan").completeObjective("steel-rangers-shipment");
    });
  }

  get canGiveThornhoofDevice() {
    const quest = game.quests.getQuest("steel-rangers/hoarfrostQuest");
    return quest.isObjectiveCompleted("report") && game.player.inventory.count("thornhoof-laboratory-device") > 0;
  }

  get thornhoofDeviceCapsReward() {
    return game.quests.getQuest("steel-rangers/hoarfrostQuest").script.capsReward;
  }

  get canAskThornhoofDeviceReward() {
    return game.player.statistics.barter >= 60;
  }

  get askedThornhoofDeviceReward() {
    return game.quests.getQuest("steel-rangers/hoarfrostQuest").hasVariable("askedReward");
  }

  onAskedThornhoofDeviceReward() {
    game.quests.getQuest("steel-rangers/hoarfrostQuest").setVariable("askedReward", 1);
  }

  waitForThornhoofDeviceForward() {
    game.player.inventory.removeItemOfType("thornhoof-laboratory-device");
    game.asyncAdvanceTime(5, function() {
      game.quests.getQuest("steel-rangers/hoarfrostQuest").completeObjective("delivery");
    })
  }

  get canAskToJoin() {
    return !game.quests.hasQuest("steel-rangers/join");
  }

  addSteelRangerQuest() {
    game.quests.addQuest("steel-rangers/join");
  }

  entryAlt() {
    switch (this.dialog.previousAnswer) {
      case "ask-about-guards":        return { textKey: "about-self" };
      case "ask-about-place":         return { textKey: "about-bunker" };
      case "ask-about-steel-rangers": return { textKey: "about-rangers" };
    }
  }
}
