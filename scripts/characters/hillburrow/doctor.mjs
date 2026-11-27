import {CharacterBehaviour} from "../character.mjs";
import {drunkenQuestOver, drunkenQuestKilledPatient} from "../../quests/hillburrow/saveDrunkenMaster.mjs"

class Doctor extends CharacterBehaviour {
  constructor(model) {
    super(model);
  }

  get dialog() {
    // She never speaks to the pony who killed her patient again.
    if (drunkenQuestKilledPatient())
      return null;
    if (drunkenQuestOver())
      return "hillburrow/doctor";
    return "hillburrow/doctor-drunk-quest";
  }

  get textBubbles() {
    if (drunkenQuestKilledPatient()) {
      return [
        { content: game.quests.getQuest("hillburrow/saveDrunkenMaster").tr("doctor-refuses"), duration: 4000, color: "red" }
      ];
    }
    return undefined;
  }

  get shop() {
    return level.findGroup("clinic");
  }
}

export function create(model) {
  return new Doctor(model);
}
