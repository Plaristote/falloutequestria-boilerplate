import CharacterBehaviour from "./guard.mjs";
import toLevelExitAction from "../components/pathfinding/goToLevelExit.mjs";

export default class extends CharacterBehaviour {
  constructor(model) {
    super(model);
  }

  goToLevelExit() {
    const reschedule = () => this.model.tasks.addTask("goToLevelExit", 5000, 1);

    toLevelExitAction(this.model, reschedule);
  }
}
