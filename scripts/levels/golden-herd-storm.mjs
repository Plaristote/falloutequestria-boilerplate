import {LevelBase} from "./base.mjs";

export default class extends LevelBase {
  constructor() {
    super();
  }

  onLoaded() {
    const rathian = game.uniqueCharacterStorage.getCharacter("rathian");

    if (rathian && rathian.script.shouldBeAtGoldenHerd && rathian.isAlive()) {
      const shelf = level.findObject("police-station.cells.storage");
      game.uniqueCharacterStorage.loadCharacterToCurrentLevel("rathian", 17, 5, 0);
      game.diplomacy.setAsEnemy(false, "rathian", "player");
      rathian.setScript("rathian/captive.mjs");
      rathian.script.trackingQuest.location = "golden-herd";
      rathian.tasks.removeTask("moveToHome");
      ["use-1", "use-2"].forEach(slot => rathian.inventory.unequipItem(slot));
      rathian.inventory.transferTo(shelf.inventory);
    }
  }

  onExit() {
    const rathian = game.uniqueCharacterStorage.getCharacter("rathian");

    if (game.playerParty.containsCharacter(rathian))
      rathian.script.onEscapedWithPlayer();
  }

  onZoneEntered(zoneName, object) {
    if (object == game.player && zoneName == "rathian-track-target") {
      const quest = game.quests.getQuest("stable-103/rathian");
      quest.completeObjective("trackCulprit");
    }
  }
}
