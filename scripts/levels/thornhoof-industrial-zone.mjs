import {LevelBase} from "./base.mjs";
import HiddenRefugees from "./components/thornhoofHiddenRefugees.mjs";
import Laboratory from "./components/thornhoofLaboratory.mjs";

function isDustlockArrested() {
  const quest = game.quests.getQuest("thornhoof/leafQuest");
  return quest && quest.getVariable("dustlockArrested", 0) == 1;
}

function removeDustlock() {
  const character = level.findObject("dustlock-home.dustlock");
  if (character)
    level.deleteObject(character);
}

export default class extends LevelBase {
  constructor(model) {
    super(model);
    this.hiddenRefugees = new HiddenRefugees(this);
    this.laboratory = new Laboratory(this);
  }

  onLoaded() {
    super.onLoaded();
    this.hiddenRefugees.onLevelLoaded("thornhoof-industrial-zone");
    if (isDustlockArrested()) removeDustlock();
  }

  onZoneEntered(zoneName, character) {
    this.laboratory.onZoneEntered(zoneName, character);
  }
}
