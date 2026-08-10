class Dialog {
  constructor(dialog) {
    this.dialog = dialog;
  }

  getEntryPoint() {
    if (this.dialog.npc.hasVariable("onBibinStart"))
      return "on-bibin-start";
    if (this.quest.script.enforcersWithdrewPeacefully)
      return "enforcers-left";
    if (this.quest.script.foughtAlongHerd)
      return "after-fight";
  }

  get quest() {
    return this.dialog.npc.script.quest;
  }

  sentByBibin() {
    return !this.quest.hidden;
  }

  canTryToNegotiate() {
    return this.quest.hasVariable("sentToNegotiate");
  }

  hasKilledEnforcers() {
    return this.quest.isObjectiveCompleted("kill-scouts");
  }

  onBibinStart() {
    if (this.dialog.npc.hasVariable("onBibinStart"))
      return { textKey: "on-bibin-restart" };
    else {
      this.dialog.npc.setVariable("onBibinStart", 1);
      this.quest.script.pushUniqueEvent("desc-met-herd-leader");
    }
  }

  onEnforcersLeft() {
    this.completeQuest();
    level.addTextBubble(this.dialog.npc, this.dialog.tr("leave-bubble"), 4500, "yellow");
  }

  completeQuest() {
    if (this.quest.script.foughtAlongHerd)
      this.quest.script.pushUniqueEvent("desc-fought-off-enforcers");
    this.quest.script.pushUniqueEvent("desc-rescued-herd");
    this.quest.completeObjective("rescue");
    this.quest.completed = true;
    level.script.herdWithdraw();
  }

  startFight() {
    this.quest.script.pushUniqueEvent("desc-betrayed-herd");
    level.findGroup("herd").objects.forEach(model => model.attacksOnSight = true);
    this.dialog.npc.setAsEnemy(game.player);
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
