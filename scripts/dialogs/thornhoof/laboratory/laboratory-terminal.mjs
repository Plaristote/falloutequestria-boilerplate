class Dialog {
  constructor(dialog) {
    this.dialog = dialog;
  }

  const sentinelQuest() {
    return game.quests.getQuest("stable-103/rathian");
  }

  canLookUpSentinel() {
    const quest = this.sentinelQuest;
    return quest && quest.hasVariable("knowsAboutSentinel") && quest.hasVariable("knowsAboutLaboratory");
  }

  canStumbleUponSentinel() {
    return this.sentinelQuest && this.sentinelQuest.hasVariable("knowsAboutSentinel");
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
