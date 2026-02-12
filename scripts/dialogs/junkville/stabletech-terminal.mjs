import {skillCheck} from "../../cmap/helpers/checks.mjs";
import {status as groundTurretStatus} from "../../characters/junkville/stabletech-turret.mjs";

function doorToggle(name, state) {
  const door = level.findObject(name);
  
  if (door && !door.destroyed) {
    const script = door.getScriptObject();
    
    script.disableAutoclose();
    door.opened = state;
    door.locked = !state;
    return true;
  }
  return false;
}

class Dialog {
  constructor(dialog) {
    this.dialog = dialog;
    this.terminalDifficulty = 1;
  }
  
  getEntryPoint() {
    return this.hasPower() ? "entry" : "power-outage";
  }
  
  hasPower() {
    const generator = level.findObject("generator-room.generator");
    return generator && generator.getScriptObject().running;
  }
  
  hasAdminRights() {
    return this.dialog.npc.path === "control-room.terminal"
        || this.dialog.npc.hasVariable("hacked");
  }
  
  isLocked() {
    return this.dialog.npc.hasVariable("locked");
  }
  
  isSecurityEnabled() {
    return level.getScriptObject().isSecurityEnabled();
  }

  tryToUnlockStorage() {
    if (!this.hasAdminRights())
      return "needs-admin-access";
    if (!doorToggle("doors.storage", true))
      return "door-broken";
    return "door-opened";
  }
  
  securityReport() {
    const enabled = this.isSecurityEnabled();

    return this.dialog.t("security-" + (enabled ? "on" : "off"), {
      sentinelCount: level.script.guards.length,
      turretStatus: this.dialog.t(`turret-status-${groundTurretStatus()}`)
    });
  }
  
  securityToggleText() {
    const enabled = this.isSecurityEnabled();
    
    return this.dialog.t("security-" + (enabled ? "disable" : "enable"));
  }
  
  toggleSecurity() {
    const enabled = this.isSecurityEnabled();

    if (!this.hasAdminRights())
      return "needs-admin-access";
    level.getScriptObject().setSecurityEnabled(!enabled);
    return "security-report";
  }
  
  hackTerminal() {
    let success = false;

    game.asyncAdvanceTime(10);
    skillCheck(this.dialog.player, "science", {
      target: 55 + this.terminalDifficulty * 23,
      success: () => {
        success = true;
        level.player.statistics.addExperience(this.terminalDifficulty * 50);
        this.dialog.npc.setVariable("hacked", 1);
      },
      criticalFailure: () => { this.dialog.npc.setVariable("locked", 1); }
    });
    if (this.isLocked())
      return "terminal-locked";
    return success ? "terminal-unlocked" : "hack-failed";
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
