import {PackMember} from "./pack-member.mjs";
import {requireQuest} from "../../quests/helpers.mjs";
import {hasAltLeaderTakenOver, hasAltLeaderBeenConvinced} from "../../quests/junkvilleNegociateWithDogs.mjs";

export class DogAltLeader extends PackMember {
  constructor(model) {
    super(model);
  }

  // Once she has been convinced to trust Fido there is nothing left to discuss
  // (and the speech must not be replayable): she only greets the player.
  get dialog() {
    return hasAltLeaderBeenConvinced() ? null : "junkville/dogs/alt-leader";
  }

  get textBubbles() {
    if (hasAltLeaderBeenConvinced())
      return [{ content: i18n.t("junkville.dogs.dolly-greets-convinced"), duration: 3545 }];
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
