import {CharacterBehaviour} from "./../../character.mjs";
import {skillCheck} from "./../../../cmap/helpers/checks.mjs";

function refugeesFightQuest() {
  return game.quests.getQuest("thornhoof/refugeesFight");
};

export default class extends CharacterBehaviour {
  constructor(model) {
    super(model);
  }

  initialize() {
    this.model.fallUnconscious();
  }

  get displayName() {
    if (refugeesFightQuest()?.script?.woundedDetected >= 3)
      return this.model.statistics.name;
    return i18n.t("quests.thornhoof/refugeesFight.woundedCharacter.displayName");
  }

  onLook() {
    const medic = game.playerParty.mostSkilledAt("medicine");
    let message = "quests.thornhoof/refugeesFight.woundedCharacter.";
    switch (refugeesFightQuest()?.script?.woundedRefugeeKnowledge) {
      case 1:
        if (!skillCheck(medic, "medicine", { target: 120 }))
        {
          message += "suspicious";
          refugeesFightQuest().script.woundedDetected = 1;
          break ;
        }
      case 2:
        message += "matchDescription";
        refugeesFightQuest().script.woundedDetected = 2;
        break ;
      default:
        return false;
    }
    game.appendToConsole(i18n.t(message));
    return true;
  }
}
