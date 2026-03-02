import {LevelBase} from "./base.mjs";
import {requireQuest} from "../quests/helpers.mjs";
import HiveElevator from "./components/unhausHiveElevator.mjs";

export default class extends LevelBase {
  constructor(model) {
    super(model);
    this.hiveElevator = new HiveElevator();
    this.caput = game.getCharacter("unhaus/idiot-changeling");
  }

  onLoaded() {
    const changelingQuest = requireQuest("changelingQuest");

    changelingQuest.completeObjective("findLair");
    if (changelingQuest.getVariable("kidnapped", 1) === 1)
      this.prepareKidnappedPlayer();
    if (this.caput && this.model.hasVariable("freedAt"))
      this.caput.script.loadIntoHive();
  }

  onZoneEntered(zoneName, character) {
    if (character === game.player && zoneName.startsWith("elevator-entry")) {
      this.hiveElevator.onElevatorEntered();
    }
  }

  onZoneExited(zoneName, character) {
    if (this.playerShouldStayInJail && character === game.player && zoneName === "jail-cell-3")
      game.diplomacy.setAsEnemy(true, "player", "changeling-hive");
  }

  initializeKidnappedPlayer() {
    const shelf = level.findObject("floor-0.jail-shelf");

    game.playerParty.list.forEach(character => character.inventory.transferTo(shelf.inventory));
  }

  prepareKidnappedPlayer() {
    this.playerShouldStayInJail = true;
  }

  freePlayerFromJail() {
    game.quests.getQuest("changelingQuest").setVariable("kidnapped", 2);
  }
}
