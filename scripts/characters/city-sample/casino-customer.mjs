import {CharacterBehaviour} from "../character.mjs";
import {RoutineComponent} from "../../behaviour/routine.mjs";

const routine = [
  { hour: "3", minute: "0",  name: "sleeping", callback: "startSleeping" },
  { hour: "8", minute: "40", name: "playing",  callback: "startPlaying"  }
];

const homeTextBubbles = [
  {content: "Hey ! Get out of my home !", duration: 5000},
  {content: "How about you go to sleep in your own house ?", duration: 6000},
  {content: "Let me sleep !", duration: 4000}
];

const playingTextBubbles = [
  {content: "Come on, come on !", duration: 3000},
  {content: "The jackpot is near, I can feel it !", duration: 4500},
  {content: "Almost there !", duration: 3000},
  {content: "Move away, you're killing my luck !", duration: 3500}
];

const transitBubbles = [
  {content: "Hi", duration: 2000},
  {content: "Hello", duration: 2000}
]

class CasinoCustomer extends CharacterBehaviour {
  constructor(model) {
    super(model);
    this.routineComponent = new RoutineComponent(this, routine);
  }

  initialize() {
    const houseIt = level.hasVariable("houseIt") ? level.getVariable("houseIt") : 3;

    level.setVariable("houseIt", houseIt + 1);
    this.model.setVariable("house", houseIt);
    this.model.setVariable("playPositionX", this.model.position.x);
    this.model.setVariable("playPositionY", this.model.position.y);
    this.routineComponent.enablePersistentRoutine();
  }

  updateTextBubbles() {
    if (this.currentSlotMachine())
      this.textBubbles = playingTextBubbles;
    else if (this.isAtHome())
      this.textBubbles = homeTextBubbles;
    else
      this.textBubbles = transitBubbles;
  }

  get currentRoutine() {
    this.routineComponent.getCurrentRoutine().callback;
  }

  get playPosition() {
    return [this.model.getVariable("playPositionX"), this.model.getVariable("playPositionY")];
  }

  get home() {
    const house = this.model.getVariable("house");

    return level.findGroup(`house${house}`);
  }

  get bed() {
    const house = this.model.getVariable("house");

    return level.findObject(`house${house}.bed`);
  }

  isAtHome() {
    const position = [this.model.position.x, this.model.position.y, this.model.floor];

    return this.home.controlZone.isInside(...position);
  }

  currentSlotMachine() {
    const position = [this.model.position.x, this.model.position.y - 1, this.model.floor];
    const object = level.getOccupantAt(...position);

    return object && object.objectName.startsWith("slot-machine") ? object : null;
  }

  isAtCasino() {
    return this.model.position.x === this.playPosition[0]
        && this.model.position.y === this.playPosition[1]
        && this.model.floor === 0;
  }

  startSleeping() {
    const actions = this.model.actionQueue;

    this.updateTextBubbles();
    if (!this.isAtHome()) {
      if (this.home.path === "house4") {
        actions.pushReachCase(40, 40, 1);
        actions.pushReachCase(40, 56, 1);
      }
      actions.pushReach(this.bed);
      actions.start();
    }
  }

  startPlaying() {
    const actions = this.model.actionQueue;
    const slotMachine = this.currentSlotMachine();

    this.updateTextBubbles();
    if (slotMachine)
      actions.pushInteraction(slotMachine, "use");
    else if (!this.isAtCasino()) {
      if (this.home.name === "house5" && this.model.position) {
        actions.pushReachCase(40, 56, 1);
        actions.pushReachCase(40, 40, 1);
      }
      actions.pushMovement(...this.playPosition);
    }
    actions.start();
  }
}

export function create(model) {
  return new CasinoCustomer(model);
}
