import {requireQuest} from "../../quests/helpers.mjs";
import {captiveReleaseAuthorized, areCaptorsDead} from "../../quests/junkvilleDumpsDisappeared.mjs";

class Dialog {
  constructor(dialog) {
    this.dialog = dialog;
    this.dialog.ambiance = "cavern";
    this.dialog.mood = "sad";
  }

  addQuest() {
    const object = requireQuest("junkvilleDumpsDisappeared");
    if (!this.wasSentByJunkville())
      object.setVariable("initBy", this.dialog.npc.objectName);
    object.completeObjective("find-disappeared");
  }

  hasCaptiveQuest() {
    return game.quests.hasQuest("junkvilleDumpsDisappeared");
  }

  wasSentByJunkville() {
    if (this.hasCaptiveQuest()) {
      const object = requireQuest("junkvilleDumpsDisappeared");
      return object.getVariable("initBy") == "cook";
    }
    return false;
  }

  wasReleaseAccepted() { return captiveReleaseAuthorized(); }

  triggerGoToExit() {
    game.level.script.sendCaptivesToExit();
  }

  onBreakout() {
    if (game.player.statistics.level > 2 && (game.player.statistics.strength > 8 || game.player.statistics.traits.indexOf("bruiser") >= 0))
    {
      this.triggerGoToExit();
      return "breakout";
    }
    return "breakout-fail";
  }

  dogsEradicated() {
    return areCaptorsDead();
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
