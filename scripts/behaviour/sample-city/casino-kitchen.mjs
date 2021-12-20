import {RoutineComponent, toggleRoutine} from "../../behaviour/routine.mjs";

export const routine = [
  { hour: "8", minute: "0",  callback: "goToWork"  },
  { hour: "3", minute: "15", callback: "goToSleep" }
];

class CasinoKitchen {
  constructor(model) {
    this.model = model;
    this.routineComponent =  new RoutineComponent(this, routine);
  }

  goToWork() {
    this.model.tasks.addTask("openKitchenDoor", 30000, 1);
  }

  goToSleep() {
    this.model.tasks.removeTask("openKitchenDoor");
    this.toggleKitchenDoor(false);
  }
  
  openKitchenDoor() {
    const occupants = this.model.getControlZoneOccupants();
    const cooks = occupants.filter(object => object.objectName === "cook");
    
    if (cooks.length > 0)
      this.toggleKitchenDoor(true);
    else
      this.model.tasks.addTask("openKitchenDoor", 151515, 1);
  }

  toggleKitchenDoor(opened) {
    const kitchenDoor = this.model.findObject("door");
    
    kitchenDoor.opened = opened;
    kitchenDoor.locked = !opened;
  }
}

export function create(model) {
  return new CasinoKitchen(model);
}
