import {Generator as DefaultGenerator} from "../../generator.mjs";

export class Generator extends DefaultGenerator {
  constructor(model) {
    super(model);
    this.repairLevel = 3;
  }

  onRunningChanged() {
    super.onRunningChanged();
    level.script.setPowerEnabled(this.running);
  }
}
