export const QuestFlags = {
  NormalQuest: 1, HiddenQuest: 2
};

export function requireQuest(name, flags) {
  let quest = game.quests.getQuest(name);

  if (!quest)
    quest = game.quests.addQuest(name, flags);
  else if (quest.hidden && (flags & QuestFlags.NormalQuest) > 0)
    quest.hidden = false;
  return quest;
}

export class QuestHelper {
  constructor(model) {
    this.model = model;
  }

  tr(name, options = {}) {
    return i18n.t(`quests.${this.model.name}.${name}`, options);
  }

  onCompleted() {
    if (this.model.failed)
      this.onFailed();
    else
      this.onSuccess();
  }
  
  completeMessage(reward) {
    return i18n.t("messages.quest-complete", {
      title: this.tr("title"),
      xp:    reward
    });
  }

  failedMessage() {
    return i18n.t("messages.quest-failed", {
      title: this.tr("title")
    });
  }

  onSuccess() {
    const reward = this.xpReward || 50;
    game.appendToConsole(this.completeMessage(reward));
    game.player.statistics.addExperience(reward);
  }

  onFailed() {
    game.appendToConsole(this.failedMessage());
  }
}
