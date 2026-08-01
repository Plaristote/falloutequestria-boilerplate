import {PackMember} from "./pack-member.mjs";
import {requireQuest} from "../../quests/helpers.mjs";
import {hasAltLeaderTakenOver} from "../../quests/junkvilleNegociateWithDogs.mjs";

export class DogAltLeader extends PackMember {
  constructor(model) {
    super(model);
  }

  get dialog() {
    return "junkville/dogs/alt-leader";
  }

  get textBubbles() {
    if (this.model.hasVariable("knowsPlayerName")) {
      return [
        { content: i18n.t("bubbles.greet-character", { name: game.player.statistics.name }), duration: 3545 }
      ];
    }
    return [];
  }

  get speakOnDetection() {
    return hasAltLeaderTakenOver() && !this.model.hasVariable("overtookTalked");
  }

  onDied() {
    super.onDied();
    requireQuest("junkvilleNegociateWithDogs").completeObjective("alt-leader-dead");
    if (this.model.statistics.faction == "_duelist") {
      level.script.reactToAltLeaderDuelDefeat();
    }
  }
}
