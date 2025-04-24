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
    if (level.name == "cristal-den-entrance") {
      const step = Math.floor(game.timeManager.day / 7);
      const candidates = ["junkville", "hillburrow", "steel-ranger-bunker"];
      if (game.hasVariable("thornhoofCaravanEnabled"))
        candidates.push("thornhoof");
      return candidates[step] || "junkville";
    }
    return "cristal-den";
  }

  set encounterCounter(value) {
    this.model.setVariable("encounterCounter", value);
  }

  get encounterCounter() {
    return this.model.getVariable("encounterCounter", 0);
  }

  set startMapPosition(value) {
    const position = game.worldmap.currentPosition;
    this.model.setVariable("startMapPosition", JSON.stringify([position.x, position.y]));
  }

  get startMapPosition() {
    const position = JSON.parse(this.model.getVariable("startMapPosition"));
    return Qt.point(position[0], position[1]);
  }

  get pendingReward() {
    return this.model.getVariable("pending-reward", 0);
  }

  set pendingReward(value) {
    this.model.setVariable("pending-reward", value);
  }

  startCaravan() {
    game.script.caravan.startCaravan(
      game.worldmap.getCurrentCity().name,
      this.nextCaravanDestination
    );
  }

  triggerNextCaravanStep() {
    game.uniqueCharacterStorage.detachCharacter(this.model);
    if (this.encounterCounter > maxEncounterCount && shouldHaveEncounter()) {
      this.encounterCounter++;
      game.loadLevel(getEncounterLocation(this), "", this.onEncounterLoaded.bind(this));
    } else {
      game.loadLevel(this.nextCaravanDestination, "", this.onArrivedAtDestination.bind(this));
    }
  }

  loadCaravanToLevel() {
    game.uniqueCharacterStorage.loadCharacterToZone(this.model.characterSheet, level.getZoneFromName("caravan-entry"));
  }

  onEncounterLoaded() {
    this.loadCaravanToLevel();
    // TODO load allies and enemies
  }

  onArrivedAtDestination() {
    this.pendingReward++;
    if (this.nextCaravanDestination === "cristal-den-entrance") {
      const city = game.worldmap.getCity(this.nextCaravanDestination);
      this.loadCaravanToLevel();
      game.worldmap.setPosition(city.position.x, city.position.y);
      // Add carts and prepare departure
    }
  }
}
