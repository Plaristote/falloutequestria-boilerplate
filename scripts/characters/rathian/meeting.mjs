import {CharacterBehaviour} from "../character.mjs";

function isDropOffLevel() {
  return worldmap.getCurrentCity() !== null;
}

class Rathian extends CharacterBehaviour {
  constructor(model) {
    super(model);
  }

  get dialog() {
    if (level.name === "rathian-meeting")
      return "rathian-introduction";
    return null;
  }
  
  get textBubbles() {
    return [
      {content: "Hi !", duration: 1500, color: "lightgreen"}
    ];
  }

  get shouldBeAtJunkville() {
    return this.model.isAlive();
  }

  isInPlayerParty() {
    return game.playerParty.find(character => { return character === this.model }) != null;
  }

  startFollowingPlayer() {
    this.model.statistics.faction = "player";
    this.model.tasks.addUniqueTask("followPlayer", 6123, 0);
  }
  
  stopFollowingPlayer() {
    this.model.statistics.faction = "";
    this.model.tasks.removeTask("followPlayer");
  }

  insertedIntoZone(zoneName) {
    console.log("Rathian inserted into zone", level.name, zoneName);
    if (isDropOffLevel()) {
      console.log("Rathian dropping ovv");
      game.playerParty.removeCharacter(this.model);
      this.stopFollowingPlayer();
      this.model.movementMode = "walking";
      this.model.tasks.addTask("talkOnArrival", 1000, 1);
      if (level.name === "junkville") {
        level.setVariable("rathianPrepared", true);
        this.model.actionQueue.pushMovement(53, 27);
        this.model.actionQueue.start();
        this.model.tasks.addTask("switchScript", 1500, 1);
      } else {
        console.log("Rathian getting deleted");
        this.model.tasks.addTask("removeRathian", 1500, 1);
      }
    }
  }

  talkOnArrival() {
    console.log("TRIGGER TALK ON ARRIVAL");
    if (!level.combat) {
      this.talkedOnArrival = true;
      level.initializeDialog(this.model, "rathian-junkville-arrival");
    }
    else
      this.model.tasks.addTask("talkOnArrival", 1000, 1);
  }

  switchScript() {
    console.log("TRIGGER WITCHCRIPT");
    if (this.talkedOnArrival)
      this.model.setScript("rathian/junkville.mjs");
    else
      this.model.tasks.addTask("switchScript", 1500, 1);
  }

  removeRathian() {
    console.log("TRIGGER REMOVAL");
    if (this.talkedOnArrival)
      game.uniqueCharacterStorage.saveCharacterFromCurrentLevel(this.model);
    else
      this.model.tasks.addTask("removeRathian", 1500, 1);
  }
}

export function create(model) {
  console.log("CREATING MEETING RATHIAN");
  return new Rathian(model);
}

