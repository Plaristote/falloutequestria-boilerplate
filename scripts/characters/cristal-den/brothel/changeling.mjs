import CharacterBehaviour from "./../../changeling.mjs";
import {requireQuest, QuestFlags} from "../../../quests/helpers.mjs";

class Changeling extends CharacterBehaviour {
  constructor(model) {
    super(model);
    model.tasks.addUniqueTask("pimpCheckTask", 3232, 1);
  }

  get dialog() {
    return "cristal-den/brothel/changeling";
  }

  get quest() {
    return game.quests.getQuest("cristal-den/pimp-changeling");
  }

  get pimp() {
    return typeof level != "undefined" ? level.findObject("brothel.pimp") : null;
  }

  initialize() {
    this.changelingTransform("earth-pony", {
      faceColor: "#9f945e",
      eyeColor: "#ff370f",
      hairColor: "#cfcfcf",
      hairTheme: "derpy",
      faceTheme: "mare-basic"
    });
  }

  onDied() {
    const quest = requireQuest("cristal-den/pimp-changeling", QuestFlags.HiddenQuest);
    quest.script.onPetioleKilled();
  }

  pimpCheckTask() {
    if (this.pimp && this.pimp.isAlive())
      this.model.tasks.addTask("pimpCheckTask", 7654, 1);
    else
      this.takeOverPimp();
  }

  assassinatePimp() {
    const actions = this.model.actionQueue;
    const pimp = level.findObject("brothel.pimp");
    const self = this.model;

    actions.pushReach(pimp, 1);
    actions.pushScript({
      onTrigger: function() {
        pimp.takeDamage(pimp.statistics.hitPoints + 1, self);
        self.script.takeOverPimp();
      },
      onCancel: function() {
        self.tasks.addTask("assassinatePimp", 5432, 1);
      }
    });
    actions.start();
  }

  takeOverPimp() {
    const actions = this.model.actionQueue;
    const self = this.model;

    actions.pushMovement(6, 6);
    actions.pushScript({
      onTrigger: this.onPimpTakenOver.bind(this),
      onCancel: function() {
        self.tasks.addTask("takeOverPimp", 5432, 1);
      }
    });
    actions.start();
  }

  onPimpTakenOver() {
    const quest = requireQuest("cristal-den/pimp-changeling", QuestFlags.HiddenQuest);
    quest.addObjective("swapPimp", quest.tr("swap-pimp"));
    quest.completeObjective("swapPimp");
    this.changelingImitate(this.pimp);
    this.pimp.inventory.transferTo(this.model.inventory);
    level.deleteObject(this.pimp);
    this.model.tasks.removeTask("takeOverPimp");
  }

  followingPlayerToKillPimp() {
    console.log("followingPlayerToKillPimp CALL");
    this.followPlayer(1);
    if (this.pimp && this.pimp.isAlive())
      this.model.tasks.addTask("followingPlayerToKillPimp", 2300, 1);
    console.log("followingPlayerToKillPimp END");
  }
}

export function create(model) {
  return new Changeling(model);
}
