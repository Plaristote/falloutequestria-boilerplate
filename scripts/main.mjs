import {RandomEncounterComponent} from "./randomEncounters.mjs";
import Caravan from "./caravan.mjs";
import {getValueFromRange} from "behaviour/random.mjs";

function contains(array, faction1, faction2) {
  return array.indexOf(faction1) >= 0 && array.indexOf(faction2) >= 0;
}

export default class extends RandomEncounterComponent {
  constructor(model) {
    super(model);
    this.caravan = new Caravan;
  }

  get rathianIntroduced() { return game.hasVariable("rathianIntroduced"); }
  set rathianIntroduced(value) { game.setVariable("rathianIntroduced", value); }

  outdoorsTick(minute) {
    if (this.caravan.hasCaravan)
      return ;
    super.outdoorsTick(minute);
  }

  onExitingLevel() {
    if (this.caravan.hasCaravan)
      this.caravan.onExitingLevel();
  }

  diplomacyUpdate(factions, hostility) {
    console.log("diplomacyUpdate", factions, hostility);
  }

  enableEncounters() {
    console.log("NOW ENABLING ECOUERs");
    game.setVariable("enable-encounters", true);
  }

  randomEncounterTrigger() {
    if (game.getVariable("enable-encounters") === true) {
      if (this.rathianIntroduced)
        super.randomEncounterTrigger();
      else
        this.randomIntroduceRathian();
    } else {
      console.log("randomEncounterTrigger: encounters disabled");
    }
  }

  randomIntroduceRathian() {
    this.rathianIt = this.rathianIt ? this.rathianIt + 1 : 1;
    if (getValueFromRange(this.rathianIt, 10) >= 8)
      this.introduceRathian();
  }

  introduceRathian() {
    if (!game.worldmap.getCurrentCity()) {
      this.rathianIntroduced = true;
      game.worldmap.paused = true;
      game.setVariable("rathianIntroduced", true);
      game.randomEncounters.prepareEncounter("rathian-meeting", {
        "optional": false,
        "title": i18n.t("encounters.ambush"),
      });
    }
  }
  
  isMainQuestDone() {
    return false;
  }
}
