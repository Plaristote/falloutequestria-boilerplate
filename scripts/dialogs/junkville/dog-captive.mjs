import {requireQuest} from "../../quests/helpers.mjs";
import {
  captiveReleaseAuthorized,
  areCaptorsDead,
  onDisappearedPoniesFound
} from "../../quests/junkvilleDumpsDisappeared.mjs";

const questName = "junkvilleDumpsDisappeared";

class Dialog {
  constructor(dialog) {
    this.dialog = dialog;
    this.dialog.ambiance = "cavern";
    this.dialog.mood = "sad";
  }

  onMeetCaptive() {
    onDisappearedPoniesFound();
  }

  hasQuest() {
    return game.quests.hasQuest(questName);
  }

  onSituationExplained() {
    if (!this.hasQuest())
      game.quests.addQuest(questName).setVariable("initBy", "captive");
  }

  wasSentByJunkville() {
    if (!game.quests.hasQuest(questName))
      return false;
    return game.quests.getQuest(questName).getVariable("initBy") == "cook";
  }

  wasReleaseAccepted() {
    return captiveReleaseAuthorized();
  }

  dogsEradicated() {
    return areCaptorsDead();
  }

  triggerGoToExit() {
    game.level.script.sendCaptivesToExit();
  }

  onBreakout() {
    const canForceIt = game.player.statistics.level > 2
      && (game.player.statistics.strength > 8 || game.player.statistics.traits.indexOf("bruiser") >= 0);
    return canForceIt ? "breakout" : "breakout-fail";
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
