import Base from "./base.mjs";

function isDropOffLevel() {
  return worldmap.getCurrentCity() !== null;
}

class Rathian extends Base {
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

  isInPlayerParty() {
    return game.playerParty.find(character => { return character === this.model }) != null;
  }

  mitigateDamage(damage, type, dealer) {
    if (!this.isInPlayerParty()) {
      damage = 1;
    }
    return super.mitigateDamage(damage, type, dealer);
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
    if (this.talkedOnArrival) {
      this.model.tasks.addTask("moveToHome", 10000, 0);
      this.model.setScript("rathian/junkville.mjs");
    }
    else
      this.model.tasks.addTask("switchScript", 1500, 1);
  }

  removeRathian() {
    console.log("TRIGGER REMOVAL");
    if (this.talkedOnArrival)
      this.model.tasks.addTask("goToLevelExit");
    else
      this.model.tasks.addTask("removeRathian", 1500, 1);
  }

  goToLevelExit() {
    const zone = level.findZones(zone => zone.type == "exit" && zone.target == "")[0];
    const target = level.getClosestPosition(zone, this.model.position);
    const actions = this.model.actionQueue;
    const reschedule = () => this.model.tasks.addTask("goToLevelExit", 5000, 1);

    actions.reset();
    actions.pushMovement(target.x, target.y, zone.floor);
    actions.pushScript({
      onTrigger: () => game.uniqueCharacterStorage.detachCharacter(this.model),
      onCancel: reschedule
    };
    if (actions.start())
      console.log("Rathian moving towards level exit");
    else
      reschedule();
  }
}

export function create(model) {
  console.log("CREATING MEETING RATHIAN");
  return new Rathian(model);
}

