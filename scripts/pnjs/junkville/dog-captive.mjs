import {CharacterBehaviour} from "../character.mjs";
import {requireQuest} from "../../quests/helpers.mjs";

function getQuest() {
  return requireQuest("junkvilleDumpsDisappeared");
}

export class DogCaptive extends CharacterBehaviour {
  constructor(model) {
    super(model);
    this.dialog = "junkville/dog-captive";
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
    quest.getScriptObject().captiveSaved();
    level.deleteObject(this.model);
  }

  onDied() {
    const quest = getQuest();
    quest.getScriptObject().onCaptiveKilled();
    super.onDied();
  }
}
