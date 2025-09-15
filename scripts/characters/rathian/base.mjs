import {CharacterBehaviour} from "../character.mjs";

export default class Rathian extends CharacterBehaviour {
  get trackingQuest() {
    return game.quests.getQuest("stable-103/rathian");
  }

  get shouldBeAtJunkville() {
    return this.trackingQuest == null;
  }

  get shouldBeAtGoldenHerd() {
    return this.trackingQuest && !this.trackingQuest.isObjectiveCompleted("trackCulprit");
  }
}
