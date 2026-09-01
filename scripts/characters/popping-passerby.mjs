import CharacterBehaviour from "./passerby.mjs";
import {getRandomCaseInZone} from "../behaviour/pathfinding.mjs";

export function popPasserby(options = {}) {
  const { popZones, characterOptions, generateInventory } = options;
  const zones     = level.findZones(zone => zone.type == "exit" && (!popZones || popZones.indexOf(zone.target) >= 0));
  const entryZone = zones[Math.floor(Math.random() * zones.length)];
  const exitZone  = zones[Math.floor(Math.random() * zones.length)];
  const sheet     = characterOptions[Math.floor(Math.random() * characterOptions.length)];
  const character = level.factory().generateCharacter("passerby", sheet);
  const position  = getRandomCaseInZone(entryZone);

  console.log("popping passerby at", entryZone, "to", exitZone);
  level.setCharacterPosition(character, position.x, position.y, entryZone.floor);
  character.setScript(options.script ? options.script : "popping-passerby");
  if (typeof generateInventory == "function")
    generateInventory(character.inventory, character);
  else if (typeof character.script.generateInventory == "function")
    character.script.generateInventory();
  character.script.startStroll(exitZone, options.buildings);
}

export default class Passerby extends CharacterBehaviour {
  constructor(model) {
    super(model);
    delete this.passerbyLocations
    Object.defineProperty(this, "passerbyLocations", {
      get() {
        return JSON.parse(this.model.getVariable("passerbyLocations", "[]"));
      },
      set(targets) {
        this.model.setVariable("passerbyLocations", JSON.stringify(targets));
      }
    });
  }

  get finishedTravels() {
    return this.model.getVariable("travels") > this.model.getVariable("travelCount");
  }

  startStroll(exitZone, buildings) {
    const travelCount = Math.floor(Math.random() * buildings.length) + 1;
    const targets = [];

    for (let i = 0 ; i < travelCount ; ++i) {
      const randomIndex = Math.floor(Math.random() * buildings.length);
      const [pickedBuilding] = buildings.splice(randomIndex, 1);
      targets.push(pickedBuilding);
    }
    this.passerbyLocations = targets;
    this.model.setVariable("travels", 0);
    this.model.setVariable("travelCount", travelCount);
    this.model.setVariable("exitZone", exitZone.name);
    this.goToNextLocation();
  }

  goToNextLocation() {
    if (!this.finishedTravels)
      super.goToNextLocation();
    else
      this.goToLevelExit();
  }

  goToLevelExit() {
    const zoneName = this.model.getVariable("exitZone");
    const zone = level.findZones(zone => zone.name == zoneName)[0];
    if (zone) {
      const target = level.getClosestPosition(zone, this.model.position);
      const actions = this.model.actionQueue;
      actions.pushMovement(target.x, target.y, zone.floor);
      actions.pushScript({
        onTrigger: () => { level.deleteObject(this.model) }, // are passerby always deleted right after movement starts?
        onCancel: this.scheduleNextTravel.bind(this)
      });
    }
  }

  onTravelCompleted() {
    const nTravel = this.model.getVariable("travels") + 1;
    this.model.setVariable("travels", nTravel);
  }
}
