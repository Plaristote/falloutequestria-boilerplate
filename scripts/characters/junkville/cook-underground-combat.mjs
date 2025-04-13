import {UndergroundCombattant} from "./underground-combattant.mjs";
import {requireQuest} from "../../quests/helpers.mjs";

export class CookUndergroundCombat extends UndergroundCombattant {
  constructor(model) {
    super(model);
  }

  get textBubbles() {
    return [
      { content: i18n.t("junkville-dogs-mediation.cook-line-1"), duration: 4545 }
    ];
  }

  get dialog() {
    const quest = requireQuest("junkvilleNegociateWithDogs");
    if (quest.isObjectiveCompleted("win-battle"))
      return "junkville/cook-battle-won";
    return null;
  }

  onDied() {
    game.setVariable("junkvilleBattleCookDied", 1);
    game.setVariable("junkvilleCookDied", 1);
    super.onDied();
  }

  shouldBeAtJunkville() {
    return this.model.isAlive();
  }
}
