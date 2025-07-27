export default class Dialog {
  constructor(dialog) {
    this.dialog = dialog;
  }

  getEntryPoint() {
    if (!this.questStarted)
      return "start";
    return "start-quest";
  }

  onStartQuest() {
    switch (this.dialog.previousAnswer) {
      case "start-quest-buffoon":
        return { textKey: "start-quest-awkward", mood: "angry" };
      case "start-quest-lie":
        game.quests.addQuest("cristal-den/pimp-changeling");
      case "start-quest-normal":
        this.dialog.npc.script.quest.completeObjective("talkToPetiole");
        return { textKey: "start-quest" };
      case "ask-target":
        this.dialog.npc.script.quest.script.onTalkedToPetiole();
        return { textKey: "about-target" };
      case "ask-about-self-twice":
        return { textKey: "about-self#2", mood: "angry" };
      case "ask-help-cute":
        return { textKey: "on-cute", mood: "cocky" };
      case "ask-help-insult":
        this.dialog.npc.setVariable("insulted", 1);
        game.dataEngine.addReputation("changeling-hive", -10);
        return { textKey: "on-insulted", mood: "angry" };
    }
    if (this.dialog.npc.hasVariable("insulted"))
      return { textKey: "start-quest-irritated", mood: "dubious" };
    return { textKey: "start-quest-reentry", mood: "dubious" };
  }

  onAskedHelp() {
    const asked = this.dialog.npc.hasVariable("askedHelp");

    this.dialog.npc.setVariable("askedHelp", 1);
    if (asked)
      return { textKey: "about-help-agan" };
  }

  get questStarted() {
    const quest = this.dialog.npc.script.quest;
    return quest != null && quest.isObjectiveCompleted("talkToPetiole");
  }

  get questPreStarted() {
    const quest = this.dialog.npc.script.quest;
    return quest != null && quest.script.startedByChangelingQueen;
  }

  get canStartQuestThroughLie() {
    return !this.questPreStarted;
  }

  get canConvinceToHelp() {
    return game.player.statistics.charisma >= 7 || game.player.statistics.speech >= 60;
  }

  get canIntimidateIntoHelping() {
    return game.player.statistics.strength >= 8;
  }

  get canSeduceIntoHelping() {
    return true;
  }

  get canConvinceAssault() {
    return game.player.statistics.speech >= 70;
  }

  get canPrepareTrap() {
    return false; // TODO check for explosives in inventory
  }
}
