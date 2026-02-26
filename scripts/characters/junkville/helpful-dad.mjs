import {CharacterBehaviour} from "../character.mjs";
import {helpfulHasDisappeared} from "../../quests/junkville/findHelpful.mjs";
import {RoutineComponent} from "../../behaviour/routine.mjs";
import {routine, initializeRoutineUser} from "./resident-routine.mjs";

export const sobbingBubbles = [
  {content: i18n.t("bubbles.sobbing-1"), duration: 3000},
  {content: i18n.t("bubbles.sobbing-2"), duration: 3000},
  {content: i18n.t("bubbles.sobbing-3"), duration: 3000}
];

export const greetingsBubbles = [
  {content: i18n.t("bubbles.greetings-1"), duration: 3000},
  {content: i18n.t("bubbles.greetings-2"), duration: 3000},
  {content: i18n.t("bubbles.greetings-3"), duration: 3000}
];

export default class HelpfulDad extends CharacterBehaviour {
  constructor(model) {
    super(model);
    this.routineComponent = new RoutineComponent(this, routine);
  }

  initialize() {
    initializeRoutineUser(this.model);
  }

  get textBubbles() {
    if (helpfulHasDisappeared() && game.quests.getQuest("junkville/findHelpful")?.completed !== true)
      return sobbingBubbles;
    return greetingsBubbles;
  }
}
