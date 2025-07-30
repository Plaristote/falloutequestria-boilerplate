import {GuardBehaviour} from "./../../guard.mjs";
import {GuardComponent} from "./../../components/guard.mjs";

const distractionDuration = 1000 * 60 * 60 * 12;

export default class extends GuardBehaviour {
  constructor(model) {
    super(model);
    this.guardComponent = new GuardComponent(this);
  }

  get dialog() {
    const quest = game.quests.getQuest("cristal-den/pimp-changeling");
    if (quest != null && quest.hasObjective("distractGuards") && !quest.isObjectiveCompleted("distractGuards") && !quest.isObjectiveCompleted("killPimp"))
      return "cristal-den/brothel/guard";
    return null;
  }

  get distractionZone() {
    return typeof level != "undefined" ? level.getTileZone("guards-distraction-zone") : null;
  }

  get isInsideDistractionZone() {
    return typeof level != "undefined" && level.isInsideZone(this.distractionZone, this.model);
  }

  startDistraction() {
    this.guardComponent.disable();
    this.model.setVariable("distracted", 1);
    this.model.tasks.addUniqueTask("endDistraction", distractionDuration, 1);
    this.model.tasks.addUniqueTask("runDistraction", 6000, 0);
    this.model.statistics.faction = "cristal-den";
    this.runDistraction();
  }

  endDistraction() {
    this.guardComponent.enable();
    this.model.unsetVariable("distracted");
    this.model.tasks.removeTask("runDistraction");
  }

  runDistraction() {
    const actionQueue = this.model.actionQueue;

    if (actionQueue.isEmpty() && !this.isInsideDistractionZone) {
      actionQueue.pushReachCase(12, 20, 2);
      actionQueue.pushReachCase(9, 0, 1);
      actionQueue.pushMoveToZone(this.distractionZone);
      actionQueue.pushScript({
        onTrigger: () => { this.model.tasks.removeTask("runDistraction"); }
      });
      actionQueue.start();
    }
  }
}
