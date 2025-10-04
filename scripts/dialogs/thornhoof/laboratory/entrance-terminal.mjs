class Dialog {
  constructor(dialog) {
    this.dialog = dialog;
  }

  labelToggleLock(door, doorKey) {
    return this.dialog.t(
      door.locked ? "lock-open" : "lock-close",
      { door: this.dialog.t(doorKey) }
    );
  }

  get laboratoryDoor() { return level.findObject("laboratory.backroom.door#1"); }
  get hallwayDoor() { return level.findObject("laboratory.door#2"); }
  get entryDoor() { return level.findObject("laboratory.door#1"); }

  labelToggleLaboratoryLock() {
    return this.labelToggleLock(this.laboratoryDoor, "laboratory-door");
  }

  labelToggleHallwayLock() {
    return this.labelToggleLock(this.hallwayDoor, "hallway-door");
  }

  labelToggleEntryLock() {
    return this.labelToggleLock(this.entryDoor, "entry-door");
  }

  toggleLaboratoryLock() {
    this.laboratoryDoor.locked = !this.laboratoryDoor.locked;
  }

  toggleHallwayLock() {
    this.hallwayDoor.locked = !this.hallwayDoor.locked;
  }

  toggleEntryLock() {
    this.entryDoor.locked = !this.entryDoor.locked;
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
