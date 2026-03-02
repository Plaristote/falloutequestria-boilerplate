import {LevelBase} from "./base.mjs";
import HiveElevator from "./components/unhausHiveElevator.mjs";

export default class extends LevelBase {
  constructor(model) {
    super(model);
    this.hiveElevator = new HiveElevator();
  }

  onZoneEntered(zoneName, character) {
    if (character == game.player && zoneName == "elevator-hive-entry") {
      this.hiveElevator.onElevatorEntered();
    }
  }

  onExit() {
    const caput = level.findObject("idiot-changeling");
    if (caput && caput.hasVariable("freedAt")) {
      caput.setVariable("freedAt", game.timeManager.getTimestamp());
      game.uniqueCharacterStorage.detachCharacter(caput);
    }
  }

  prepareKidnappedPlayer() {
    ;
  }
}
