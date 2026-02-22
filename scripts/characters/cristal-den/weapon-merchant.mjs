import {ShopOwner} from "./../shop-owner.mjs";
import {RoutineComponent} from "../../behaviour/routine.mjs";
import {callGuards, AlarmLevel} from "../components/alarm.mjs";
import {overrideBehaviour} from "../../behaviour/override.mjs";

function isInsidePrivateZone(shop, character) {
  const backroom = shop.findGroup("backroom");
  const appartments = shop.findGroup("upper-floor");

  return level.isInsideZone(backroom.controlZone, character)
      || level.isInsideZone(appartments.controlZone, character);
}

export class WeaponMerchant extends ShopOwner {
  constructor(model) {
    super(model);
    this.model.tasks.addTask("initializeBackdoorWatch", 100, 1);
    this.routine = new RoutineComponent(this, [
      { hour: "8", minute: "20", callback: "goToWork" },
      { hour: "19", minute: "31", callback: "goToSleep" }
    ]);
  }

  get dialog() {
    return "cristal-den/weapon-merchant";
  }

  get bed() {
    return this.shop.findObject("bedroom.bed");
  }

  get shopShelfs() {
    return this.shop.findGroup("backroom").find(candidate => {
      return candidate.objectName.startsWith("shelf");
    });
  }

  initializeBackdoorWatch() {
    const door = this.shop.findObject("door#3");
    overrideBehaviour(door.script, "onUse", this.onBackdoorOpening.bind(this));
    overrideBehaviour(door.script, "onUseLockpick", this.onBackdoorOpening.bind(this));
  }

  onBackdoorOpening(user) {
    if (user === game.player)
      return !this.shop.script.onShopliftAttempt(user);
  }

  onIntruderDetected(character) {
    callGuards(this.shop.script.guards, character, AlarmLevel.Arrest);
  }

  onCharacterDetected(character) {
    if (character === game.player && isInsidePrivateZone(this.shop, character)) {
      this.onIntruderDetected(character);
    } else {
      super.onCharacterDetected();
    }
  }

  onTalkTo() {
    if (isInsidePrivateZone(this.shop, character)) {
      this.onIntruderDetected(character);
      return false;
    }
    return super.onTalkTo();
  }
}
