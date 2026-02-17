import {CharacterBehaviour} from "../character.mjs";
import {DealWithRathian} from "./flags.mjs";

function gaveUpSentinel(model) {
  const flag = model.getVariable("dealWithRathian");
  return (flag & DealWithRathian.GaveUpSentinel) > 0;
}

export default class Rathian extends CharacterBehaviour {
  get trackingQuest() {
    return game.quests.getQuest("stable-103/rathian");
  }

  get shouldBeAtJunkville() {
    return this.trackingQuest == null || gaveUpSentinel(this.model);
  }

  get shouldBeAtGoldenHerd() {
    return this.trackingQuest && !this.trackingQuest.isObjectiveCompleted("trackCulprit");
  }

  get shouldGetSentinelWithPlayer() {
    return this.model.hasVariable("acquireSentinelWithPlayer");
  }
}
