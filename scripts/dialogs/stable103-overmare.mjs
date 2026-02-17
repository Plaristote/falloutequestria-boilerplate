class Dialog {
  constructor(dialog) {
    this.dialog = dialog;
  }

  get mainQuest() {
    return game.quests.getQuest("celestialDevice");
  }

  get rathianQuest() {
    return game.quests.getQuest("stable-103/rathian");
  }

  getEntryPoint() {
    if (this.rathianQuest != null && !this.rathianQuest.isObjectiveCompleted("overmareBrief"))
      return "rathian-quest/intro";
    return "entryPoint";
  }

  speakerTechnician() {
    this.dialog.swapNpc(level.findObject("pipbuck-dude"));
  }

  speakerEngineer() {
    this.dialog.swapNpc(level.findObject("engineer"));
  }

  speakerOvermare() {
    this.dialog.swapNpc(level.findObject("overmare"));
  }

  canReportJunkvilleTrail() {
    return !this.mainQuest.completed && !this.dialog.npc.hasVariable("reportedJunkvilleTrail") && worldmap.discoveredCities.indexOf("junkville") >= 0;
  }

  canReportBlueprints() {
    return !this.mainQuest.completed && !this.mainQuest.hasVariable("reportedBlueprints") && game.player.inventory.count("celestial-device-blueprints") > 0;
  }

  canReportFoundARM() {
    return !this.mainQuest.completed && this.mainQuest.hasVariable("reportedBlueprints") && !this.dialog.npc.hasVariable("reportedARM") && game.player.inventory.count("celestial-device-mra");
  }

  canReportCelestialDevice() {
    return !this.mainQuest.completed && game.player.inventory.count("celestial-device") > 0;
  }

  reportJunkville() {
    this.dialog.npc.setVariable("reportedJunkvilleTrail", 1);
  }

  reportBlueprints() {
    this.mainQuest.setVariable("reportedBlueprints", 1);
  }

  reportBlueprintsEngineer() {
    this.dialog.swapNpc(level.findObject("engineer"));
  }

  reportBlueprintsBackToOvermare() {
    const quest = game.quests.getQuest("celestialDevice");
    if (!quest.hasObjective("find-arm-module"))
      quest.addObjective("find-arm-module", quest.script.tr("find-arm-module"));
    this.dialog.swapNpc(level.findObject("overmare"));
  }

  reportFoundARM() {
    this.dialog.npc.setVariable("reportedARM", 1);
  }

  canBuildCelestialDevice() {
    return game.player.statistics.repair >= 95 || game.player.statistics.science >= 110;
  }

  reportARMEngineer() {
    this.dialog.swapNpc(level.findObject("engineer"));
  }

  canTeachCelestialDevice() {
    return this.mainQuest.hasVariable("reportedBlueprints") && this.canBuildCelestialDevice() && game.player.inventory.count("celestial-device-mra");
  }

  buildCelestialDevice() {
    const quest = game.quests.getQuest("celestialDevice");
    quest.script.onBuildCelestialDeviceInPlace();
  }

  reportCelestialDevice() {
    const quest = game.quests.getQuest("celestialDevice");
    quest.script.onBroughtCelestialDevice();
  }

  celestialDeviceRest() {
    const quest = game.quests.getQuest("celestialDevice");
    const room = level.findGroup("level#1.rooms.room#8");
    game.playerParty.insertIntoZone(level, room.controlZone);
    quest.script.onQuestFollowup();
  }

  rathianBriefingDone() {
    this.rathianQuest.completeObjective("overmareBrief");
    this.speakerOvermare();
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
