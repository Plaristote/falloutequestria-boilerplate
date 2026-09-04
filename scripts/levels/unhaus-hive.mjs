import {LevelBase} from "./base.mjs";
import {requireQuest} from "../quests/helpers.mjs";
import HiveElevator from "./components/unhausHiveElevator.mjs";
import {BacktrackCaptureScene} from "../scenes/unhaus/backtrackCapture.mjs";

export default class extends LevelBase {
  constructor(model) {
    super(model);
    this.hiveElevator = new HiveElevator();
    this.caput = game.getCharacter("unhaus/idiot-changeling");
    this.ambiance = "cavern";
  }

  get jailShelf() {
    return level.findObject("floor-0.jail-shelf");
  }

  get queen() {
    return level.findObject("floor-2.throne-room.queen");
  }

  get backtrack() {
    return level.find(character => character.characterSheet === "unhaus/backtrack")[0];
  }

  onLoaded() {
    const changelingQuest = requireQuest("changelingQuest");

    changelingQuest.completeObjective("findLair");
    if (changelingQuest.getVariable("kidnapped", 1) === 1)
      this.prepareKidnappedPlayer();
    if (this.caput && this.model.hasVariable("freedAt"))
      this.caput.script.loadIntoHive();
    if (game.hasVariable("backtrackLoadIntoHive"))
      game.uniqueCharacterStorage.getCharacter("unhaus/backtrack").script.loadIntoHive();
    if (level.hasVariable("backtrackCaptureStarted")) {
      this.loadBacktrackCaptureGuards();
      this.requireBacktrackCaptureScene();
    }
  }

  onExit() {
    this.onExitBacktrackAssault();
  }

  onZoneEntered(zoneName, character) {
    if (character === game.player && zoneName.startsWith("elevator-entry")) {
      this.hiveElevator.onElevatorEntered();
    } else if (character.characterSheet === "unhaus/backtrack" && zoneName.startsWith("pony-storage")) {
      character.script.onFoundDaughter();
    }
  }

  onZoneExited(zoneName, character) {
    if (this.playerShouldStayInJail && character === game.player && zoneName === "jail-cell-3" && !level.hasVariable("guardSentPlayerToQueen"))
      game.diplomacy.setAsEnemy(true, "player", "changeling-hive");
  }

  initializeKidnappedPlayer() {
    game.playerParty.list.forEach(character => {
      character.inventory.unequipAllItems();
      character.inventory.transferTo(this.jailShelf.inventory)
    });
  }

  prepareKidnappedPlayer() {
    this.playerShouldStayInJail = true;
  }

  freePlayerFromJail() {
    game.quests.getQuest("changelingQuest").setVariable("kidnapped", 2);
  }

  // BEGIN Backtrack
  // Assault
  onExitBacktrackAssault() {
    const backtrack = this.backtrack;
    const searchingFather = game.quests.getQuest("unhaus/searching-father");
    const quest = requireQuest("investigateUnhaus");
    const jailed = searchingFather && searchingFather.completed;

    if (backtrack && backtrack.isAlive()) {
      const queen = this.queen;
      const queenIsDead = queen == null || !queen.isAlive();

      // Completed his objective and safely left
      if (!jailed && queenIsDead && backtrack.hasVariable("foundDaughter")) {
        level.deleteObject(backtrack);
        quest.script.onBacktrackSafelyLeftHive();
      }
      // Did not complete his objective, was killed by changeling and left in the pony-storage
      else {
        level.moveCharacterToZone(backtrack, level.getZoneFromName("pony-storage"));
        backtrack.takeDamage(backtrack.statistics.hitPoints);
        quest.script.onBacktrackDiedInHive();
      }
    }
  }
  // Capture
  get backtrackCaptureScene() {
    return this.requireBacktrackCaptureScene();
  }

  requireBacktrackCaptureScene() {
    if (!this._backtrackCaptureScene)
      this._backtrackCaptureScene = new BacktrackCaptureScene(this);
    return this._backtrackCaptureScene;
  }

  loadBacktrackCaptureGuards() {
    const members = level.find(character => character.objectName.startsWith("backtrack-capture-guards"));

    this.backtrackCaptureGuards = game.createNpcGroup({
      "name": "backtrack-capture-guards",
      "faction": "changeling-hive",
      "members": members
    });
  }

  startBacktrackCaptureScene() {
    if (!level.hasVariable("backtrackCaptureStarted")) {
      level.setVariable("backtrackCaptureStarted", 1);
      this.backtrackCaptureGuards = game.createNpcGroup({
        "name": "backtrack-capture-guards",
        "faction": "changeling-hive",
        "members": [
          { "sheet": "unhaus/changeling-guard" },
          { "sheet": "unhaus/changeling-guard" },
          { "sheet": "unhaus/changeling-guard" },
          { "sheet": "unhaus/changeling-guard" },
          { "sheet": "unhaus/changeling-guard" }
        ]
      });
      level.insertPartyIntoZone(this.backtrackCaptureGuards, "backtrack-capture-guard-entry");
      level.tasks.addTask("delayedStartBacktrackCaptureScene", 500, 1);
    }
  }

  delayedStartBacktrackCaptureScene() {
    this.backtrackCaptureScene.initialize();
  }
  // END Backtrack
}
