const trashTalkingRaces = [
  "diamond-dogs", "earth-pony", "gator-pony", "griffon", "pegasus", "unicorn"
];

export function canTrashTalk(model) {
  return trashTalkingRaces.indexOf(model.statistics.race) >= 0;
}

function getTrashTalkLine(alignment, category) {
  const key = `bubbles/trash-talk.${alignment}.${category}`;
  const number = Math.round(Math.random() * 6);
  return i18n.t(`${key}.${number}`);
}

export default class TrashTalkComponent {
  constructor(parent, options = {}) {
    this.parent     = parent;
    this.model      = parent.model;
    this.alignment  = options.alignment || "evil";
    this.chance     = options.talkRatio || 0.15;
    this.cooldownMs = 6000;
    this._lastTauntAt = 0;
  }

  isTauntDelayExpired() {
    return (Date.now() - this._lastTauntAt) >= this.cooldownMs;
  }

  canTaunt() {
    return this.model.isAlive() && !this.model.unconscious && this.isTauntDelayExpired();
  }

  lineDuration(text) {
    return Math.max(2000, text.length * 90);
  }

  specializeCategory(category) {
    if (category == "hurt" && this.model.statistics.hpPercentage < 15)
      return "hurt-bad";
    return category;
  }

  triggerTaunt(category) {
    if (this.canTaunt() && Math.random() <= this.chance) {
      const text = getTrashTalkLine(this.alignment, category);
      this.parent.displayRandomTextBubble([{
        content: text,
        duration: this.lineDuration(text),
        color: "crimson",
      }]);
      this._lastTauntAt = Date.now();
      return true;
    }
    return false;
  }
}
