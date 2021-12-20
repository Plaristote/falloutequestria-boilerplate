class Dialog {
  constructor(dialog) {
    this.dialog = dialog;
  }

  get quest() {
    return game.quests.getQuest("catch-robber");
  }
  
  getEntryPoint() {
    if (this.dialog.npc.getVariable("escaping"))
      return "saved";
    return "intro";
  }

  hasRobberQuest() {
    return game.quests.hasQuest("catch-robber");
  }

  tryToInitmidate() {
    if (game.player.statistics.strength > 5)
      return "come-with";
    return "run-for-it";
  }

  tryToConvince() {
    if (game.player.statistics.speech > 80)
      return "come-with";
    return "run-for-it";
  }

  onRobberFound() {
    this.quest.completeObjective("find");
  }

  onComeWith() {
    this.quest.getScriptObject().startRobberNpcDialog();
    this.quest.completeObjective("bring-robber");
    this.quest.completed = true;
  }

  onEscapeAttempt() {
    this.dialog.npc.statistics.faction = "";
    this.dialog.npc.statisticsChanged();
    this.dialog.npc.setAsEnemy(game.player);
  }

  onEscaped() {
    level.deleteObject(this.dialog.npc); // Problem ?
    this.quest.completeObjective("help-escape");
    this.quest.completed = true;
  }

  onCompleted() {
    const xp = 1000;

    game.appendToConsole(i18n.t("messages.quest-complete", {
      title: this.tr("title"),
      xp: xp
    }));
    game.player.statistics.addExpierence(xp);
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
