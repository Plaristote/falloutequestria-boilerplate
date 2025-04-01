import {Terminal} from "./terminal.mjs";

export class TerminalChemistryLab extends Terminal {
  constructor(model) {
    super(model);
    this.dialogEntryState = "chemistry-lab/entry";
  }
}
