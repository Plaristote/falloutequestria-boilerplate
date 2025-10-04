class Dialog {
  constructor(dialog) {
    this.dialog = dialog;
  }

  getEntryPoint() {
    if (!this.dialog.npc.script.hacked)
      return "locked";
    return this.customEntryPoint();
  }

  customEntryPoint() {
    switch (this.dialog.npc.path) {
      case "2.laboratory.terminal": return "entry-laboratory";
    }
    return "entry";
  }

  get isSecurityEnabled() {
    return level.script.securityEnabled;
  }

  toggleSecurity() {
    level.script.securityEnabled = !level.script.securityEnabled;
  }

  onStaffRegistered() {
    level.script.registeredAsStaff = true;
  }

  onRemoveStaffRegistration() {
    level.script.removeStaffRegistrations();
  }

  hackTerminal() {
    return this.dialog.npc.script.hackTerminal(game.player)
      ? this.customEntryPoint()
      : "hack-failure";
  }

  toggleLaboratoryTurret() {
    const turret = level.script.laboratoryTurret;
    turret.script.popUp();
    turret.statistics.faction = "player";
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
