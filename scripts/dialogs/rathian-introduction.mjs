class Dialog {
  constructor(dialog) {
    this.dialog = dialog;
    this.introduced = this.dialog.npc.hasVariable("met");
    this.dialog.npc.setVariable("met", true);
  }

  getEntryPoint() {
    if (this.introduced)
      return "accompany";
    return "introduction";
  }

  get combatEval() {
    const killCount =
      game.player.statistics.getKillCount("earth-pony") +
      game.player.statistics.getKillCount("unicorn");
    return this.dialog.t(`combat-eval-${killCount > 1 ? "good" : "bad"}`);
  }

  onComeWith() {
    console.log("onComeWith called");
    console.log("onComeWith:", level.getScriptObject());
    console.log("onComeWith:", level.getScriptObject().playerJoinsRathian);
    level.getScriptObject().playerJoinsRathian();
  }

  onJoinParty() {
    level.getScriptObject().rathianJoinsPlayer();
    this.dialog.npc.getScriptObject().startFollowingPlayer();
  }

  accompany() {
    if (this.introduced)
      return i18n.t("dialogs.rathian-introduction.accompany-again");
    this.onJunkvilleDisclosed();
    return i18n.t("dialogs.rathian-introduction.accompany");
  }

  onJunkvilleDisclosed() {
    worldmap.revealCity("junkville");
  }

  onStableDisclosed() {
    game.setVariable("rathian-knows-stable-location", true);
  }
  
  onTalkedAboutDevice() {
    this.dialog.npc.setVariable("talked-about-device", true);
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
