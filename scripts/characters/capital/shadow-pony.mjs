import {CharacterBehaviour} from "../character.mjs";
import {injectRoamTask} from "../tasks/roam.mjs";
import {requireQuest, QuestFlags} from "../../quests/helpers.mjs";

export class ShadowPony extends CharacterBehaviour {
  constructor(model) {
    super(model);
    injectRoamTask(this);
    this.prepareRoamTask(3);
    this.xpBaseValue = 95;
  }

  onDied() {
    super.onDied();
    requireQuest("cristal-den/ghoulExpedition", QuestFlags.HiddenQuest).script.onMonsterKilled(this.model);
  }
}
