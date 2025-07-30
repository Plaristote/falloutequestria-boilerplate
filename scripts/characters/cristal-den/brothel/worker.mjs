import {CharacterBehaviour} from "./../../character.mjs";

function makeBubble(key, duration = 3500, color = "white") {
  return {
    content: i18n.t("dialogs.cristal-den/brothel.worker." + key),
    duration: duration,
    color: color
  }
}

const streetTextBubbles = [
  makeBubble("street-bubble-a"),
  makeBubble("street-bubble-b")
];

const brothelTextBubbles = [
  makeBubble("street-bubble-b")
];

const pimpedTextBubbles = [
  makeBubble("pimped-bubble-a"),
  makeBubble("pimped-bubble-b"),
];

const swappedTextBubbles = [
  makeBubble("swapped-bubble-a"),
  makeBubble("swapped-bubble-b"),
];

class Worker extends CharacterBehaviour {
  constructor(model) {
    super(model);
  }

  get contextualTextBubbles() {
    const quest = game.quests.getQuest("cristal-den/pimp-changeling");
    if (quest && quest.script.timeHasPassedSincePimpsPassing)
      return swappedTextBubbles;
    return pimpedTextBubbles;
  }

  get textBubbles() {
    if (this.hasARoom)
      return this.contextualTextBubbles.concat(brothelTextBubbles);
    return this.contextualTextBubbles.concat(streetTextBubbles);
  }

  get hasARoom() {
    return this.model.parent?.parent?.name == "rooms";
  }
}

export function create(model) {
  return new Worker(model);
}
