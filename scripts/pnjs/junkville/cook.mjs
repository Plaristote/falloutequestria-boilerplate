import {CharacterBehaviour} from "../character.mjs";
import {requireQuest} from "../../quests/helpers.mjs";
import {RoutineComponent} from "../../behaviour/routine.mjs";
import {routine, initializeRoutineUser} from "./resident-routine.mjs";

export class Cook extends CharacterBehaviour {
  constructor(model) {
    super(model);
    this.routineComponent = new RoutineComponent(this, routine);
  }

  initialize() {
    initializeRoutineUser(this.model);
  }

  onDied() {
    game.setVariable("junkvilleCookDied", 1);
    super.onDied();
  }

  get dialog() {
    if (this.model.tasks.hasTask("headTowardsBattle"))
      return ;
    return "junkville/cook";
  }

  get bed() {
    return level.findObject("inn.floor.owner-room.bed");
  }

  shouldBeAtJunkville() {
    return true;
  }

  headTowardsBattle() {
    const reached = () => { return this.model.position.x === 17 && this.model.position.y === 1; };
    const model = this.model;

    if (this.model.actionQueue.isEmpty() && !reached()) {
      this.model.actionQueue.pushMovement(17, 1);
      this.model.actionQueue.pushScript(() => {
        if (reached()) {
          game.asyncAdvanceTime(27);
          requireQuest("junkvilleNegociateWithDogs").completed = true;
          model.getScriptObject().onDied();
          level.deleteObject(model);
          //game.uniqueCharacterStorage.saveCharacterFromCurrentLevel(model);
        }
      });
      this.model.actionQueue.start();
    }
  }
}
