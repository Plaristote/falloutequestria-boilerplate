class Dialog {
  constructor(dialog) {
    this.dialog = dialog;
  }

  isPlayerLookingForCelestialDevice() {
    return !game.quests.getQuest("celestialDevice").isObjectiveCompleted("craftDevice");
  }

  onTalkedAboutDevice() {
    const factions = game.getVariable("celestial-device-disclosure", []);
    factions.push("potioks");
    game.setVariable(factions);
  }

  nextCreationDialog() {
    const state = this.dialog.npc.getVariable("inventionQuestState", 0);
    switch (state)
    {
      case 0: return this.powerhoofCurrentEntry();
    }
    return "creations/finished";
  }

  powerhoofCurrentEntry() {
    return "creations/powerhoof-intro";
  }

  powerhoofRiskScienceCheck() {
    return game.player.statistics.science >= 70;
  }

  powerhoofTinkeringCheck() {
    return game.player.statistics.repair >= 80;
  }

  powerhoofStartTesting() {
    console.log("TODO implement powerhoofStartTesting");
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
