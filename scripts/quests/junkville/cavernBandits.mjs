import {QuestHelper} from "../helpers.mjs";

const questName = "junkville/cavernBandits";

export class extends QuestHelper {
  initialize() {
    this.model.location = "junkville";
    this.model.addObjective("find-lair");
  }

  completeObjective(objective) {
    if (objective == "find-lair") {
      if (!this.hasOneOfEvents(["dogs-told-lair", "item-told-lair"]))
        this.pushUniqueEvent("found-lair");
      this.model.addObjective("remove-bandits");
    }
    else if (objective == "remove-bandits") {
      this.pushUniqueEvent("removed-bandits");
      this.model.completed = true;
    }
  }

  getDescription() {
    let desc = "";

    this.events.forEach(event => {
      desc += "<p>" + this.model.tr(`desc-${event}`) + "</p>";
    });
    return desc;
  }
}
