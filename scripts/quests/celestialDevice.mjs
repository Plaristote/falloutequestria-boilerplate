import {QuestHelper, requireQuest} from "./helpers.mjs";

const questName = "celestialDevice";

export class CelestialDevice extends QuestHelper {
  initialize() {
    this.model.location = "stable";
  }

  onItemPicked(item) {
    switch (item.itemType) {
    case "celestial-device-mra":
      this.model.addObjective("find-arm-module", this.tr("find-arm-module"));
      this.model.completeObjective("find-arm-module");
      break ;
    case "celestial-device-blueprints":
      this.model.addObjective("find-blueprints", this.tr("find-blueprints"));
      this.model.completeObjective("find-blueprints");
      this.model.completeObjective("explore-junkille-facility");
      break ;
    }
  }
}
