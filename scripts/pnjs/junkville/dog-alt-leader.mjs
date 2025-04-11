import {PackMember} from "./pack-member.mjs";
import {requireQuest} from "../../quests/helpers.mjs";
import {internalPackIssueDone} from "../../quests/junkvilleNegociateWithDogs.mjs";

export class DogAltLeader extends PackMember {
  constructor(model) {
    super(model);
  }

  get dialog() {
    if (!internalPackIssueDone())
      return "junkville/dogs/alt-leader";
    return null;
  }

  get textBubbles() {
    if (this.model.hasVariable("knowsPlayerName")) {
      return [
        { content: i18n.t("bubbles.greet-character", { name: game.player.statistics.name }), duration: 3545 }
      ];
    }
    return [];
  }

  onDied() {
    super.onDied();
    requireQuest("junkvilleNegociateWithDogs").completeObjective("alt-leader-dead");
  }
}
