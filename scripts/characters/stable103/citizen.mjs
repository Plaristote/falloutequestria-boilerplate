import {PasserbyBehaviour} from "../passerby.mjs";

function initializeHomePosition(character) {
  if (!character.hasVariable("homeX")) {
    character.setVariable("homeX", character.position.x);
    character.setVariable("homeY", character.position.y);
    character.setVariable("homeZ", character.floor);
  }
}

function homePosition(character) {
  return {x: character.getVariable("homeX"), y: character.getVariable("homeY"), z: character.getVariable("homeZ")};
}

function initializeLocations(character) {
  return [
    "level#1.bar", "level#2.library", "level#0.hallway", "level#2.administration-office",
    homePosition(character)
  ];
}

export class Citizen extends PasserbyBehaviour {
  constructor(model) {
    initializeHomePosition(model);
    super(model, initializeLocations(model), {min: 60, max: 180});
    this.textBubbles = [
      {content: i18n.t("stable103.bubbles.passerby-1", {name: game.player.statistics.name}), duration: 5000},
      {content: i18n.t("stable103.bubbles.passerby-2", {name: game.player.statistics.name}), duration: 5000},
      {content: i18n.t("stable103.bubbles.passerby-3", {name: game.player.statistics.name}), duration: 5000}
    ];
  }

  goToNextLocation() {
    if (game.timeManager.hour > 21 || game.timeManager.hour < 7)
      this.goToHome();
    else if (!game.fastPassTime && !game.player.getVariable("resting"))
      super.goToNextLocation();
  }
  
  goToHome() {
    console.log("-> citizen Go to home");
    let travelStarted = false;
    const target = homePosition(this.model);

    if (this.model.position.x != target.x || this.model.position.y != target.y || this.model.floor != target.z) {
      this.model.actionQueue.reset();
      this.model.actionQueue.pushMovement(target.x, target.y, target.z);
      travelStarted = this.model.actionQueue.start();
    }
    if (!travelStarted)
      this.scheduleNextTravel();
  }
}
