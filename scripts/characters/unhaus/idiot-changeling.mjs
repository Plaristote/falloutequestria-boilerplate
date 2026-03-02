import {CharacterBehaviour} from "./../character.mjs";
import {overrideBehaviour} from "../../behaviour/override.mjs";

export default class extends CharacterBehaviour {
  constructor(model) {
    super(model);
    this.dialog = "unhaus/idiot-changeling";
  }

  get speakOnDetection() {
    return !this.model.hasVariable("met");
  }

  onLoaded() {
    if (level.name == "unhaus") {
      this.blockingDoor = level.findObject("floor-3.caput-locker.door");
      overrideBehaviour(this.blockingDoor, "onToggle", this.onFreedFromLocker.bind(this));
    }
  }

  onFreedFromLocker() {
    this.model.isUnique = true;
    this.model.setVariable("freedAt", game.timeManager.getTimestamp());
  }

  loadIntoHive() {
    const freedAt = this.model.getVariable("freedAt");

    if (game.timeManager.getTimestamp() - freedAt > 60*60) {
      game.uniqueCharacterStorage.loadCharacterToCurrentLevel(this.model, 29, 5, 1);
      this.model.unsetVariable("freedAt");
      this.model.isUnique = false;
    }
  }
}
