export default class Dialog {
  constructor(dialog) {
    this.dialog = dialog;
  }

  getEntryPoint() {
    if (level.name == "ovipostor-meeting")
      return "encounter/entry";
    return "hive/entry";
  }

  get metInEncounter() {
    return this.dialog.npc.hasVariable("metInEncounter");
  }

  get metCaput() {
    return game.hasVariable("knowAboutCaput");
  }

  get canIntimidate() {
    return game.player.statistics.level >= 10 || game.player.inventory.getEquippedItem("armor")?.itemType == "power-armor";
  }

  hiveIntroduction() {
    if (this.dialog.npc.hasVariable("metInEncounter")) {
      if (this.dialog.npc.hasVariable("intimidated"))
        return { textKey: "hive/introIntimidated" };
      return { textKey: "hive/introMet", mood: "dubious" };
    }
  }

  onIntimidated() {
    this.dialog.npc.setVariable("intimidated", 1);
  }

  startFight() {
    this.dialog.npc.setAsEnemy(game.player);
  }

  prompt() {
    switch (this.dialog.previousAnswer) {
      case "ask-about":
        return { textKey: "hive/on-self", mood: "neutral" };
      case "about-murder":
        return { textKey: "hive/on-murder", mood: "cocky" };
      case "about-queen":
        return { textKey: "hive/on-queen", mood: "neutral" };
      case "about-caput":
        return { textKey: "hive/on-caput", mood: "smile" };
    }
  }
}
