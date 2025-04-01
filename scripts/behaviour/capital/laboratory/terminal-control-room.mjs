import {Terminal} from "./terminal.mjs";

export class TerminalControlRoom extends Terminal {
  constructor(model) {
    super(model);
    this.dialogEntryState = "control-room/entry";
  }
}
