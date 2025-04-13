import {CharacterBehaviour} from "../character.mjs";
import {requireQuest} from "../../quests/helpers.mjs";
import {hasBattleStarted} from "../../quests/junkvilleNegociateWithDogs.mjs";

function getQuest() {
  return requireQuest("junkvilleDumpsDisappeared");
}

export class DogCaptive extends CharacterBehaviour {
  get dialog() {
    return !hasBattleStarted() && !level.hasVariable("captive-escaping") ? "junkville/dog-captive" : null;
  }

  reachExitZone() {
    if (this.model.actionQueue.isEmpty() && !level.isInCombat(this.model)) {
      const ladder = level.findObject("ladder-dumps");
      this.model.actionQueue.pushReach(ladder);
      this.model.actionQueue.pushScript(() => {
        if (this.model.getDistance(ladder) < 5)
          this.onSaved();
      });
      this.model.actionQueue.start();
    }
  }

  onSaved() {
    const quest = getQuest();
    quest.script.captiveSaved();
    level.deleteObject(this.model);
  }

  onDied() {
    const quest = getQuest();
    quest.script.onCaptiveKilled();
    super.onDied();
  }
}
