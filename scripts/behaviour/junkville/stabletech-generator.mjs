import {Generator} from "../generator.mjs";

export class StabletechGenerator extends Generator {
  onRunningChanged() {
    const commandTerminal = level.findObject("control-room.terminal");
    const sentinels = level.findGroup("security-room").objects;

    super.onRunningChanged();
    commandTerminal.script.enabled = this.running;
    level.script.guards.forEach(sentinel => {
      if (this.running) {
        sentinel.wakeUp();
        sentinel.setAnimation("get-up");
      }
      else {
        sentinel.fallUnconscious();
        sentinel.setAnimation("fall-down");
      }
    });
  }
}
