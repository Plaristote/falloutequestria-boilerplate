import {LevelBase} from "./base.mjs";
import HiddenRefugees from "./components/thornhoofHiddenRefugees.mjs";

export default class extends LevelBase {
  constructor(model) {
    super(model);
    this.hiddenRefugees = new HiddenRefugees(this);
  }

  onLoaded() {
    super.onLoaded();
    this.hiddenRefugees.onLevelLoaded("thornhoof-town");
  }
}
