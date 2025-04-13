import {CharacterBehaviour} from "../character.mjs";
import {requireQuest} from "../../quests/helpers.mjs";

const datastore = "stabletech-factory-";
const States = {
  GoToDumps: 0,
  SurfaceBackroom: 1,
  WaitInSurfaceBackroom: 2,
  GoToSurfaceMainRoom: 3,
  ArrivedAtFacility: 4,
  FollowingPlayerInFacilty: 5,
  FixingGenerator: 6,
  SearchingStockRoom: 7,
  Done: 1000
};

// todo fix turret faction issue

function backroomComputer() {
  return level.findObject("stabletech-facility.computer#1");
}

function frontDoor() {
  return level.findObject("stabletech-facility.door-exterior");
}

class Rathian extends CharacterBehaviour {
  constructor(model) {
    super(model);
    this.model.tasks.addUniqueTask("autopilot", 3456, 0);
    if (!this.model.hasVariable(`${datastore}-state`))
      this.state = 0;
  }

  get state() { return this.model.getVariable(`${datastore}-state`); }
  set state(value) { this.model.setVariable(`${datastore}-state`, value); }

  get dialog() {
    const quest = requireQuest("junkvilleStabletechFacility");

    if (quest && quest.isObjectiveCompleted("find-blueprints"))
      return "rathian-facility-end";
    return null;
  }

  shouldPopAtDumps()    { return this.state === States.GoToDumps; }
  shouldPopAtFacility() { return this.state === States.GoToSurfaceMainRoom; }

  autopilot() {
    if (!this.model.actionQueue.isEmpty()) return ;
    console.log("autopilot", this.state);
    switch (this.state) {
    case States.GoToDumps:
      return this.headTowardsDumps();
    case States.SurfaceBackroom:
      return this.headTowardsSurfaceBackroom();
    case States.GoToSurfaceMainRoom:
      return this.goToSurfaceMainRoom();
    case States.ArrivedAtFacility:
      return this.arrivedAtFacility();
    case States.FollowingPlayerInFacilty:
      return this.followPlayer(); // from MovementComponent
    case States.FixingGenerator:
      return this.fixGenerator();
    case States.SearchingStockRoom:
      return this.searchingStockRoom();
    }
  }

  headTowardsDumps() {
    this.model.actionQueue.pushMovement(17, 1);
    this.model.actionQueue.pushScript(this.onReachedDumpsEntryZone.bind(this));
    this.model.actionQueue.start();
  }

  onReachedDumpsEntryZone() {
    if (this.model.position.x === 17 && this.model.position.y === 1)
      game.uniqueCharacterStorage.saveCharacterFromCurrentLevel(this.model);
  }

  headTowardsSurfaceBackroom() {
    const backdoor = level.findObject("stabletech-facility.backdoor");
    const computer = backroomComputer();

    console.log("HEAD TOWARDZ ZURVAce BACKROOM");
    if (this.model.position.y > 145)
      this.model.actionQueue.pushMovement(22, 145);
    if (this.model.position.y > 115)
      this.model.actionQueue.pushMovement(28, 115);
    if (this.model.position.y > 72)
      this.model.actionQueue.pushMovement(29, 72);
    if (this.model.position.y > 29)
      this.model.actionQueue.pushMovement(39, 29);
    this.model.actionQueue.pushReach(backdoor);
    this.model.actionQueue.pushReach(computer);
    this.model.actionQueue.pushScript(this.onFirstTerminalReached.bind(this));
    this.model.actionQueue.start();
  }

  onFirstTerminalReached() {
    const computer = backroomComputer();
    const door = frontDoor();

    if (this.model.getDistance(computer) <= 1) {
      this.state++;
      level.addTextBubble(this.model, i18n.t("junkville-stabletech.rathian-first-computer"), 6565);
      computer.setAnimation("monitor-left-on");
      door.getScriptObject().disableAutoclose();
      door.opened = true;
    }
  }

  onSurfaceMainRoomDoorOpened() {
    if (this.state === States.WaitInSurfaceBackroom) {
      const door = frontDoor();

      this.state++;
      level.addTextBubble(this.model, i18n.t("junkville-stabletech.rathian-head-downstairs"), 4321);
      door.getScriptObject().enableAutoclose();
    }
  }

  goToSurfaceMainRoom() {
    const stairs = level.findObject("stabletech-facility.stairs");
    this.model.actionQueue.pushReach(stairs);
    this.model.actionQueue.start();
  }

  onPlayerGoesDownstairs() {
    if (this.state === States.GoToSurfaceMainRoom)
      game.setVariable("rathianGoingToStabletechFacility", 1);
    else
      game.setVariable("playerLeftRathianInDumps", 1);
  }

  arrivedAtFacility() {
    level.addTextBubble(this.model, i18n.t("junkville-stabletech.rathian-downstairs-arrival"), 10000);
    this.model.attacksOnSight = false;
    this.model.movementMode = "running";
    this.model.statistics.faction = "player";
    this.state++;
  }

  onPlayerGoesUpstairs() {
    if (this.state === States.Done) {
      this.model.attacksOnSight = true;
      this.model.movementMode = "walking";
      this.model.statistics.faction = "rathian";
      game.setVariable("rathianGoingBackToJunkville", 1);
    }
  }

  /*
   * Roaming in the facility
   */
  onZoneEntered(zone) {
    console.log("onZoneEntered", level.name, zone.name);
    if (level.name == "junkville-stabletech-facility") {
      switch (zone.name) {
        case "security-room":
          return this.onEnteredSecurityRoom();
        case "generator-room":
          return this.onEnteredGeneratorRoom();
        case "stock-room":
          return this.onEnteredStockRoom();
        case "near-stock-room":
          return this.onApproachedStockRoom();
      }
    }
  }

  // Security room
  onEnteredSecurityRoom() {
    const levelScript = level.getScriptObject();
    if (!this.securityWarningGiven && !levelScript.isSecurityEnabled() && levelScript.guards.length > 0) {
      this.securityWarningGiven = true;
      level.addTextBubble(this.model, i18n.t("junkville-stabletech.rathian-security-room-warning"), 7500);
    }
  }

  // Generator room
  onEnteredGeneratorRoom() {
    const generator = level.findObject("generator-room.generator");

    if (!generator.script.running) {
      level.addTextBubble(this.model, i18n.t("junkville-stabletech.rathian-will-fix-generator"), 7500);
      this.state = States.FixingGenerator;
    }
  }

  fixGenerator() {
    const generator = level.findObject("generator-room.generator");

    this.model.movementMode = "walking";
    this.model.actionQueue.pushReach(generator);
    this.model.actionQueue.pushInteraction(generator, "use");
    this.model.actionQueue.pushSpeak(i18n.t("junkville-stabletech.rathian-fix-generator#1"), 3000, "white");
    this.model.actionQueue.pushWait(3);
    this.model.actionQueue.pushInteraction(generator, "use");
    this.model.actionQueue.pushSpeak(i18n.t("junkville-stabletech.rathian-fix-generator#2"), 2500, "yellow");
    this.model.actionQueue.pushWait(2);
    this.model.actionQueue.pushInteraction(generator, "use");
    this.model.actionQueue.pushSpeak(i18n.t("junkville-stabletech.rathian-fix-generator#3"), 3000, "lightgreen");
    this.model.actionQueue.pushScript({
      onTrigger: this.fixGeneratorCallback.bind(this, generator, true),
      onCancel: this.fixGeneratorCallback.bind(this, generator, false)
    });
    this.model.actionQueue.start();
  }

  fixGeneratorCallback(generator, actionReached) {
    if (generator.script.running)
      level.addTextBubble(this.model, i18n.t("junkville-stabletech.rathian-player-fixed-generator"), 5000, "lightgreen");
    else if (actionReached)
      generator.script.running = true;
    else
      return ;
    this.model.movementMode = "running";
    this.state = States.FollowingPlayerInFacilty;
  }

  // Stock room
  onApproachedStockRoom() {
    if (!this.stockRoomApproached) {
      const door = level.findObject("doors.storage");

      this.stockRoomApproached = true;
      this.model.actionQueue.pushSpeak(i18n.t("junkville-stabletech.rathian-stock-room-intro"), 3000, "white");
      this.model.actionQueue.pushReach(door);
      if (!door.opened)
        this.model.actionQueue.pushInteraction(door, "use");
      this.model.actionQueue.pushScript(() => {
        console.log("Coucou onApproachedStockRoom", door, this.model);
        if (door.canGoThrough(this.model))
          this.state = States.SearchingStockRoom;
        else
          level.addTextBubble(this.model, i18n.t("junkville-stabletech.rathian-stock-room-locked"), 7500, "white");
      });
      this.model.actionQueue.start();
    }
  }

  onEnteredStockRoom() {
    level.addTextBubble(this.model, i18n.t("junkville-stabletech.rathian-stock-room-reached"), 7500, "white");
    this.state = States.SearchingStockRoom;
  }

  searchingStockRoom() {
    const storageRoom = level.findGroup("storage-room");
    const crateNumber = Math.floor(Math.random() * storageRoom.objects.length);
    const crate       = storageRoom.objects[crateNumber];

    this.model.movementMode = "walking";
    this.model.actionQueue.pushReach(crate);
    this.model.actionQueue.pushInteraction(crate, "use");
    this.model.actionQueue.pushWait(2);
    this.model.actionQueue.start();
  }
}

export function create(model) {
  console.log("CREATING sTABLE TECH vACILITY RATHIAN");
  return new Rathian(model);
}
