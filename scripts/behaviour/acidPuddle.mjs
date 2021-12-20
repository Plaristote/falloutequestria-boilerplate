class AcidPuddle {
  constructor(model) {
    this.model = model;
  }
  
  initialize() {
    this.model.toggleSneaking(true);
    this.model.interruptOnDetection = true;
    this.model.blocksPath = false;
    this.model.tasks.addTask("inflictBurn", 3500, 0);
  }
 
  inflictBurn() {
    const occupants = this.model.getControlZoneOccupants();
    const characters = occupants.filter(object => object.getObjectType() == "Character");

    characters.forEach(character => character.takeDamage(10, null));
  }

  onDetected() {
    game.appendToConsole("You detected a puddle of acid");
  }
}

export function create(model) {
  return new AcidPuddle(model);
}
