export class MaQuest {
  constructor(model) {
    this.model = model;
  }

  initialize() {
    console.log("MaQuest: on quest start");
  }

  onCharacterKilled(victim, killer) {
    console.log("MaQuest: on character kill", victim, killer);
  }

  onItemPicked(item) {
    console.log("MaQuest: on item picked", item);
  }

  getObjectives() {
    return [
      {label: "objectif lune", success: true},
      {label: "objectif dodo", failed: true},
      {label: "objectif ovh"}
    ];
  }
}

export function create(model) {
  return new MaQuest(model);
}
