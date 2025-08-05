class Dialog {
  constructor(dialog) {
    this.dialog = dialog;
  }

  getEntryPoint() {
    if (this.quest != null) {
      if (this.quest.completed)
        return "default-entry";
      switch (this.quest.script.batchInProgress) {
        case 1:
          return `party-mintals/batch-${this.quest.script.isPreparationDone() ? "ready" : "not-ready"}`;
        case 2:
          return `party-mintals/testing-${this.quest.script.isTestingDone() ? "ready": "not-ready"}`;
      }
      return "party-mintals/reentry";
    }
  }

  get quest() {
    return game.quests.getQuest("cristal-den/happy-pills");
  }

  canTalkAboutChemistry() {
    return game.player.statistics.science >= 50;
  }

  canHelpWithChemistry() {
    return (game.player.statistics.science >= 50 && game.player.statistics.medicine >= 60)
        || (game.player.statistics.science >= 70);
  }

  canStartPartyTimeQuest() {
    return !game.quests.hasQuest("cristal-den/happy-pills");
  }

  startHappyPillsQuest() {
    game.quests.addQuest("cristal-den/happy-pills");
  }

  partyMintalsHasSample() {
    return game.player.inventory.count(this.quest.script.itemName);
  }

  partyMintalsReceiveSample() {
    game.player.inventory.removeItemOfType(this.quest.script.itemName);
    this.quest.completeObjective("bringSample");
  }

  partyMintalsStartBatch() {
    this.quest.script.startPreparation();
  }

  partyMintalsStartBatchWithPlayer() {
    this.quest.script.startPreparationWithHelp();
  }

  partyMintalsTestStart() {
    this.quest.script.startTesting();
  }

  partyMintalsTestStartWithPlayer() {
    this.quest.script.startTestingOnPlayer();
  }

  partyMintalsTestOver() {
    this.quest.completeObjective("testBatch");
    game.player.inventory.addItemOfType(this.quest.script.itemName);
  }

  aboutToExit() {
    if (this.canStartPartyTimeQuest())
      return "party-mintals/interrupt";
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
