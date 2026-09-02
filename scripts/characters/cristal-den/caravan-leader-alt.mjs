import {CharacterBehaviour} from "../character.mjs";

function caravanForceNextDestination(value) {
  const weekDay = game.timeManager.weekDay;
  const days = weekDay == 0 ? 1 : 9 - weekDay;
  const seconds = game.timeManager.secondsUntilTime({ days, hour: 23, minute: 59, second: 59 });
  game.setVariable("enforceNextCaravanAt", game.timeManager.getTimestamp() + seconds);
  game.setVariable("enforceNextCaravan", value);
}

function caravanForcedNextDestination() {
  const timestamp = game.getVariable("enforceNextCaravanAt", 0);

  if (timestamp > game.timeManager.getTimestamp())
    return game.getVariable("enforceNextCaravan");
  return null;
}

export default class extends CharacterBehaviour {
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
      return caravanForcedNextDestination() || candidates[step] || "junkville";
    }

    // On departure from anywhere else
    return "cristal-den";
  }

  set nextCaravanDestination(value) {
    caravanForceNextDestination(value);
  }

  startCaravan() {
    game.script.caravan.startCaravan(
      game.worldmap.getCurrentCity().name,
      this.nextCaravanDestination
    );
  }
}
