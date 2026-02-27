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

  spendMoney(price) {
    if (!this.roomsAreNowFree)
      super.spendMoney(price);
  }

  innDialogLine(params) {
    if (this.roomsAreNowFree)
      return this.dialog.tr("roomsAreFree");
    return super.innDialogLine(params);
  }
}
