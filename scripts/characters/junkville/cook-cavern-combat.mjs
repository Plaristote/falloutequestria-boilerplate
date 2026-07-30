import CavernCombattant from "./cavern-combattant.mjs";
import {requireQuest} from "../../quests/helpers.mjs";

const questName = "junkville/cavernBandits";

export default class extends CavernCombattant {
  constructor(model) {
    super(model);
  }

  get textBubbles() {
    return [
      { content: i18n.t("junkville-dogs-mediation.cook-line-1"), duration: 4545 }
    ];
  }

  get dialog() {
    const quest = requireQuest(questName);
    if (quest.isObjectiveCompleted("remove-bandits"))
      return "junkville/cook-bandits-won";
    return null;
  }

  onDied() {
    const quest = requireQuest(questName);
    game.setVariable("junkvilleBattleCookDied", 2);
    game.setVariable("junkvilleCookDied", 1);
    quest.script.pushUniqueEvent("cook-died");
    super.onDied();
  }

  shouldBeAtJunkville() {
    return this.model.isAlive();
  }
}
