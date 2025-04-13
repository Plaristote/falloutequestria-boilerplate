import {CharacterBehaviour} from "../character.mjs";
import {VendettaScene} from "../../scenes/cristal-den/rainy-purple-vendetta.mjs";
import {findLiveSlaver} from "../../quests/cristal-den/rainy-purple-vendetta.mjs";

const drinkingStation = [28, 72];

export class RainyPurple extends CharacterBehaviour {
  constructor(model) {
    super(model);
    this.scene = new VendettaScene(this);
    this.quest = game.quests.getQuest("cristal-den/rainy-purple-vendetta");
  }

  seekAndDestroy() {
    const actions = this.model.actionQueue;

    if (!level.combat && actions.isEmpty()) {
      const slaver = findLiveSlaver();

      this.model.movementMode = "running";
      actions.pushReach(slaver);
      actions.start();
    }
  }

  freeSlaves() {
    const actions = this.model.actionQueue;

    if (actions.isEmpty()) {
      const door = level.findObject("slavers-den.slave-pen.door");
      const scene = this.sceneManager;
      const character = this.model;

      this.model.movementMode = "walking";
      actions.pushReach(door);
      actions.pushScript(function() {
        door.locked = false;
      });
      actions.pushInteraction(door, "use");
      actions.pushScript(function() {
        scene.triggerNextStep();
        character.tasks.removeTask("freeSlaves");
      });
      actions.pushMovement(30, 41);
      actions.start();
    }
  }

  onVendettaOver() {
    const self = this;

    this.model.tasks.removeTask("freeSlaves");
    this.model.tasks.addTask("goToBar", 3102, 0);
    this.goToBar();
  }

  goToBar() {
    const actions = this.model.actionQueue;

    if (!level.combat && actions.isEmpty())
    {
      this.model.movementMode = "walking";
      actions.pushMovement(...drinkingStation);
      actions.start();
    }
  }

  get dialog() {
    if (this.model.position.x == drinkingStation[0] && this.model.position.y == drinkingStation[1]) {
      return "cristal-den/rainy-purple";
    }
  }
}
