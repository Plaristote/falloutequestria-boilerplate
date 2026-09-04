import {Innkeeper} from "../innkeeper.mjs";

export default class extends Innkeeper {
  constructor(dialog) {
    super(dialog);
  }

  getEntryPoint() {
    if (this.firstMeetingCheck())
      return "introduction";
  }

  get roomsAreNowFree() {
    return level.hasVariable("guestRoomIsFree");
  }

  get backtrackRentingRoom() {
    return level.findObject("backtrack") != null;
  }

  pickRandomRoom() {
    if (this.backtrackRentingRoom)
      return 2;
    return super.pickRandomRoom();
  }

  spendMoney(price) {
    if (!this.roomsAreNowFree)
      super.spendMoney(price);
    else
      level.unsetVariable("guestRoomIsFree");
  }

  innDialogLine(params) {
    if (this.roomsAreNowFree)
      return this.dialog.tr("roomsAreFree");
    return super.innDialogLine(params);
  }
}
