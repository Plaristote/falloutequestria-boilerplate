import {Terminal} from "./terminal.mjs";

export class TerminalEntrace extends Terminal {
  get alimented() {
    return true;
  }

  get sleeping() {
    return level.getVariable("power") != 1;
  }

  get dialogEntryState() {
    if (level.getVariable("power") == 1)
      return "normal/entry";
    return "restricted-mode/entry";
  }
}
