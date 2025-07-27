import CharacterBehaviour from "./../../changeling.mjs";

class Changeling extends CharacterBehaviour {
  constructor(model) {
    super(model);
  }

  get dialog() {
    const quest = this.quest;

    if (!quest || quest.inProgress)
      return "cristal-den/brothel/changeling";
    return null;
  }

  get quest() {
    return game.quests.getQuest("cristal-den/pimp-changeling");
  }

  initialize() {
    this.changelingTransform("earth-pony", {
      faceColor: "#9f945e",
      eyeColor: "#ff370f",
      hairColor: "#cfcfcf",
      hairTheme: "derpy",
      faceTheme: "mare-basic"
    });
  }
}

export function create(model) {
  return new Changeling(model);
}
