import {CharacterBehaviour} from "../character.mjs";

const baseBubbles = [
  {content: "I'm busy. Leave and close the door behind you.", duration: 3500, color: "yellow"},
  {content: "Now isn't a good time. Scram.", duration: 3000, color: "yellow"},
  {content: "You've got nothing to do here. Leave my office this instant.", duration: 3500, color: "yellow"}
];

const mordinoBubbles = [
  {content: "Thank you for your help in the Mordino case.", duration: 3500, color: "white"},
  {content: "This is a peaceful town, now, Thanks to you.", duration: 3000, color: "lightgreen"},
];

class PoliceChief extends CharacterBehaviour {
  get textBubbles() {
    const quest = game.quests.getQuest("catch-mordino");

    if (quest && quest.completed)
      return mordinoBubbles;
    return baseBubbles;
  }

  get dialog() {
    const quest = game.quests.getQuest("catch-mordino");

    if (quest && !quest.completed)
      return "town-sheriff";
    return null;
  }
}

export function create(model) {
  return new PoliceChief(model);
}
