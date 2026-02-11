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

const eventStorageKey = "_events";

export class QuestHelper {
  constructor(model) {
    this.model = model;
  }

  tr(name, options = {}) {
    return i18n.t(`quests.${this.model.name}.${name}`, options);
  }

  get events() {
    return JSON.parse(this.model.getVariable(eventStorageKey, "[]"));
  }

  pushUniqueEvent(event) {
    if (!this.hasEvent(event))
      this.pushEvent(event);
  }

  pushEvent(event) {
    const events = this.events;
    events.push(event);
    this.model.setVariable(eventStorageKey, JSON.stringify(events));
  }

  hasEvent(event) {
    return this.events.indexOf(event) >= 0;
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

export class Flag {
  constructor(model, attribute = "flags") {
    this.model = model;
    this.attribute = attribute;
  }

  get value() {
    return this.model.getVariable(this.attribute, 0);
  }

  set value(val) {
    this.model.setVariable(this.attribute, val);
  }

  add(flag) {
    this.value = flag | this.value;
  }

  remove(flag) {
    if (this.has(flag))
      this.value -= flag;
  }

  has(flag) {
    return (this.value & flag) > 0;
  }
}
