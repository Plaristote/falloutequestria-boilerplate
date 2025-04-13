import {CharacterBehaviour} from "../character.mjs";
import {isAfterVengeanceSpeechEnabled, failVengeance} from "../../quests/hillburrow/oldSheriffMurder.mjs";

export class Sheriff extends CharacterBehaviour {
  get dialog() {
    return "hillburrow/sheriff";
  }

  get speakOnDetection() {
    return isAfterVengeanceSpeechEnabled(this.model);
  }

  offscreenVengeance() {
    const actions = this.model.actionQueue;

    actions.pushMovement(0, 12);
    actions.pushScript(this.finalizeOffscreenVengeance.bind(this));
    actions.start();
  }

  finalizeOffscreenVengeance() {
    level.deleteObject(this.model);
    failVengeance();
  }
}
