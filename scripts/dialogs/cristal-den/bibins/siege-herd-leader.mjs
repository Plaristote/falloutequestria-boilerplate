class Dialog {
  constructor(dialog) {
    this.dialog = dialog;
  }

  getEntryPoint() {
    if (this.dialog.npc.hasVariable("onBibinStart"))
      return "on-bibin-start";
    if (this.quest.script.foughtAlongHerd)
      return "after-fight";
  }

  get quest() {
    return this.dialog.npc.script.quest;
  }

  sentByBibin() {
    return !this.quest.hidden;
  }

  hasKilledEnforcers() {
    return this.quest.isObjectiveCompleted("kill-scouts");
  }

  onBibinStart() {
    if (this.dialog.npc.hasVariable("onBibinStart"))
      return { textKey: "on-bibin-restart" };
    else
      this.dialog.npc.setVariable("onBibinStart", 1);
  }

  completeQuest() {
    this.quest.completeObjective("rescue");
    this.quest.completed = true;
  }

  startFight() {
    level.findGroup("herd").objects.forEach(model => model.attacksOnSight = true);
    this.dialog.npc.setAsEnemy(game.player);
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
