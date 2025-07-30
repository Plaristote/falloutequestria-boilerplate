import {Generator} from "../generator.mjs";

export class StabletechGenerator extends Generator {
  onRunningChanged() {
    super.onRunningChanged();
    level.script.togglePower(this.running);
  }
}
