import {Terminal} from "./terminal.mjs";

export class TerminalAlimentation extends Terminal {
  get alimented() {
    return level.getVariable("powerRedirected") != 1;
  }

  get sleeping() {
    return level.getVariable("power") != 1 && level.getVariable("powerRedirected") != 1;
  }

  get dialogEntryState() {
    if (level.getVariable("power") == 1)
      return "normal/entry";
    return "restricted-alim/entry";
  }
}
