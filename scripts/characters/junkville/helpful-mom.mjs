import CharacterBehaviour from "./helpful-dad.mjs";
import {RoutineComponent} from "../../behaviour/routine.mjs";
import {routine, initializeRoutineUser} from "./resident-routine.mjs";
import {helpfulHasDisappeared, canTalkAboutMissingHelpful} from "../../quests/junkville/findHelpful.mjs";
import {HelpfulReturnScene} from "../../scenes/junkville/helpfulReturn.mjs";

function broughtBackHelpful() {
  return game.playerParty.find(character => character.characterSheet == "helpful-copain") != null;
}

export class HelpfulMom extends CharacterBehaviour {
  constructor(model) {
    super(model);
  }

  get dialog() {
    if (this.routineComponent.isActiveRoutine("assembly"))
      return ;
    return canTalkAboutMissingHelpful() ? "junkville/helpful-mom-quest" : null;
  }

  broughtBackHelpful() {
    const helpful = game.playerParty.findCharacter(character => character.characterSheet == "helpful-copain");
    return helpful != null;
  }

  onCharacterDetected(character) {
    if (helpfulHasDisappeared()
      && level.script.helpfulReturnScene
      && character.characterSheet == "helpful-copain") {
      if (!level.script.helpfulReturnScene.active)
        level.script.helpfulReturnScene.initialize();
    }
    super.onCharacterDetected(character);
  }
}
