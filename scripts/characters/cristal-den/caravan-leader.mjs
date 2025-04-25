import {CharacterBehaviour} from "../character.mjs";

export class CaravanLeader extends CharacterBehaviour {
  constructor(model) {
    super(model);
  }

  get dialog() {
    if (game.script.caravan.hasCaravan)
      return null;
    return "cristal-den/caravan-leader";
  }

  get nextCaravanDestination() {
    // Thornhoof Caravan Quest handler for the first of the two caravan steps
    if (level.name == "steel-ranger-entrance") {
      const thornhoofCaravanQuest = game.quests.getQuest("thornhoof/caravan");
      if (thornhoofCaravanQuest?.script?.caravanInProgress)
        return "thornhoof";
    }

    // On departure from Crystal Den
    if (level.name == "cristal-den-entrance") {
      const step = Math.floor(game.timeManager.day / 7);
      const candidates = ["junkville", "hillburrow", "steel-ranger-bunker"];
      if (game.hasVariable("thornhoofCaravanEnabled"))
        candidates.push("thornhoof");
      return candidates[step] || "junkville";
    }

    // On departure from anywhere else
    return "cristal-den";
  }

  startCaravan() {
    game.script.caravan.startCaravan(
      game.worldmap.getCurrentCity().name,
      this.nextCaravanDestination
    );
  }
}
