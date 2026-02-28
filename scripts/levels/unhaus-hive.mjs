import {LevelBase} from "./base.mjs";
import HiveElevator from "./components/unhausHiveElevator.mjs";

export default class extends LevelBase {
  constructor(model) {
    super(model);
    console.log("INITIALIZE UNHAUS-HIVE SCRIPT");
    this.hiveElevator = new HiveElevator();
  }

  onZoneEntered(zoneName, character) {
    if (character == game.player && zoneName.startsWith("elevator-entry")) {
      this.hiveElevator.onElevatorEntered();
    }
  }

  prepareKidnappedPlayer() {
    console.log("prepareKidnappedPlayer called!")
  }
}
