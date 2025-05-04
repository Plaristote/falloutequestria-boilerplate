function expellPlayerFromControlZone(group) {
  const occupants = group ? group.getControlZoneOccupants() : [];

  for (let i = 0 ; i < occupants.length ; ++i) {
    if (occupants[i] === game.player) {
      level.moveCharacterToZone(occupants[i], "");
      break ;
    }
  }
}

function showRentedRoom(innkeeper, fromPosition, room, attempts) {
  const actions = innkeeper.actionQueue;
  const door = room.findObject("door");

  console.log("showRentedRoom", attempts);
  actions.reset();
  if (attempts < 3) {
    actions.pushReach(door, 3);
    actions.pushScript({
      onCancel: () => {
        this.showRentedRoom = showRentedRoom.bind(this, innkeeper, fromPosition, room, attempts + 1);
        this.model.tasks.addTask("showRentedRoom", 2000, 1);
      }
    });
    actions.pushSpeak(i18n.t("innkeep.show-room-bubble"), 5000, "white");
    actions.pushWait(4);
  }
  actions.pushMovement(fromPosition.x, fromPosition.y, fromPosition.z);
  actions.start();
}

export default class Inn {
  constructor(model) {
    this.model = model;
    if (typeof this.roomGroup === "undefined")
      this.roomGroup = this.model;
  }

  initialize() {
    this.lockAllRooms();
  }

  get innkeeper() {
    return this.model.findObject("innkeeper");
  }

  get rentedRoomNumber() {
    return this.model.getVariable("rentNumber", null);
  }

  set rentedRoomNumber(value) {
    if (!value) { this.model.unsetVariable("rentNumber"); }
    else { this.model.setVariable("rentNumber", value); }
  }

  get rentExpiresAt() {
    return this.model.getVariable("rentUntil", 0);
  }

  set rentExpiresAt(value) {
    if (!value) { this.model.unsetVariable("rentUntil"); }
    else { this.model.setVariable("rentUntil", value); }
  }

  get rentSecondsLeft() {
    return Math.max(0, this.rentExpiresAt - game.timeManager.getTimestamp());
  }

  get roomCount() {
    let count = 0;
    for (let i = 0 ; this.roomGroup && i < this.roomGroup.groups.length ; ++i) {
      const group = this.roomGroup.groups[i];
      if (group.name.startsWith("room#"))
        count++;
    }
    return count;
  }

  getRandomRoom() {
    return 1 + Math.floor(Math.random() * this.roomCount);
  }

  getRoomByNumber(number) {
    return this.roomGroup.findGroup(`room#${number}`);
  }

  getRentedRoom() {
    return this.getRoomByNumber(this.rentedRoomNumber);
  }

  lockAllRooms() {
    for (let i = 0 ; i < this.roomCount ; ++i)
      this.toggleRoomLock(i + 1, true);
  }

  toggleRoomLock(number, value) {
    const room = this.getRoomByNumber(number);
    const door = room ? room.findObject("door") : null;
    if (door) {
      door.opened = false;
      door.locked = value;
    }
  }

  rentRoom(number, duration) {
    this.rentedRoomNumber = number;
    this.rentExpiresAt = game.timeManager.getTimestamp() + Math.ceil(duration / 1000);
    this.model.tasks.addTask("onRentRoomOver", duration, 1);
    this.toggleRoomLock(number, false);
  }

  onRentRoomOver() {
    const room = this.getRoomByNumber(this.rentedRoomNumber);
    const occupants = room ? room.getControlZoneOccupants() : [];

    this.toggleRoomLock(this.rentedRoomNumber, true);
    this.rentedRoomNumber = this.rentExpiresAt = null;
    expellPlayerFromControlZone(room);
  }

  showRentedRoom(innkeeper) {
    const room = this.getRentedRoom();
    const position = { x: innkeeper.position.x, y: innkeeper.position.y, z: innkeeper.floor };

    if (room) {
      this.showRentedRoom = showRentedRoom.bind(this, innkeeper, position, room, 0);
      this.showRentedRoom();
    } else {
      console.log("Inn.showRentedRoom: no room currently on rent");
    }
  }
}

export function create(model) {
  return new Inn(model);
}
