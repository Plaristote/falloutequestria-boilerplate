import {RandomEncounterComponent} from "./randomEncounters.mjs";
import Caravan from "./caravan.mjs";
import GhoulHunterExpedition from "./behaviour/cristal-den/ghoulHunterExpedition.mjs";
import cristalDenPatrol from "./behaviour/cristal-den/copper-patrol.mjs";
import {getValueFromRange} from "./behaviour/random.mjs";
import makeEndGameSlides from "./slides/endGame.mjs";

function contains(array, faction1, faction2) {
  return array.indexOf(faction1) >= 0 && array.indexOf(faction2) >= 0;
}

export default class extends RandomEncounterComponent {
  constructor(model) {
    super(model);
    this.caravan = new Caravan;
    this.ghoulHunterExpedition = new GhoulHunterExpedition;
  }

  get rathianIntroduced() { return game.hasVariable("rathianIntroduced"); }
  set rathianIntroduced(value) { game.setVariable("rathianIntroduced", value); }
  get rathianTrack() { return game.hasVariable("rathianTrack"); }
  set rathianTrack(value) { game.setVariable("rathianTrack", value); }

  get activeCaravans() {
    return [this.caravan, this.ghoulHunterExpedition, cristalDenPatrol()]
      .filter(caravan => caravan.hasCaravan);
  }
  get activeProcesses() {
    return this.activeCaravans;
  }

  outdoorsTick(minute) {
    if (this.rathianTrack)
      game.quests.getQuest("stable-103/rathian").script.updateRathianTrack();
    if (this.activeCaravans.length > 0)
      return ;
    super.outdoorsTick(minute);
  }

  onLoaded() {
    this.activeProcesses.forEach(controller => controller.onGameLoaded());
  }

  onExitingLevel() {
    this.activeProcesses.forEach(controller => controller.onExitingLevel());
  }

  diplomacyUpdate(factions, hostility) {
    console.log("diplomacyUpdate", factions, ", hostility=", hostility);
    if (hostility && factions.indexOf("player") >= 0) {
      if (factions.indexOf("cristal-den") >= 0) {
        ["potioks", "cristal-den-slavers", "cristal-den-slaves", "cristal-den-brothel"]
          .forEach(faction => { game.diplomacy.setAsEnemy(true, "player", faction); });
      }
      if (factions.indexOf("potioks") >= 0) {
        game.diplomacy.setAsEnemy(true, "player", "hillburrow-potioks");
      }
    }
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
    const minDelay = 60 * 60 * 12 * 1;
    const minStartAt = game.getVariable("startedAt") + minDelay;

    if (game.timeManager.getTimestamp() > minStartAt) {
      this.rathianIt = this.rathianIt ? this.rathianIt + 1 : 1;
      if (getValueFromRange(this.rathianIt, 10) >= 8)
        this.introduceRathian();
    }
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

  getEndGameSlides() {
    return makeEndGameSlides();
  }
  
  isMainQuestDone() {
    return false;
  }
}
