import {QuestHelper, requireQuest} from "./helpers.mjs";

const questName = "celestialDevice";

export class CelestialDevice extends QuestHelper {
  initialize() {
    this.model.location = "stable-103";
  }

  getDescription() {
    let text = this.model.tr("description");
    if (this.model.isObjectiveCompleted("find-blueprints"))
      text += "<br><br>" + this.model.tr("description-blueprints");
    if (this.model.isObjectiveCompleted("find-arm-module"))
      text += "<br><br>" + this.model.tr("description-arm-module");
    return text;
  }

  onItemPicked(item) {
    switch (item.itemType) {
    case "celestial-device-mra":
      if (!this.model.hasObjective("find-arm-module"))
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
