import {CharacterBehaviour} from "../character.mjs";
import {drunkenQuestOver} from "../../quests/hillburrow/saveDrunkenMaster.mjs"

class Doctor extends CharacterBehaviour {
  constructor(model) {
    super(model);
  }

  get dialog() {
    if (drunkenQuestOver())
      return "hillburrow/doctor";
    return "hillburrow/doctor-drunk-quest";
  }
}

export function create(model) {
  return new Doctor(model);
}
