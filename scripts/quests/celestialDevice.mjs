import {QuestHelper, requireQuest} from "./helpers.mjs";

const questName = "celestialDevice";

export class CelestialDevice extends QuestHelper {
  get xpReward() {
    return 5000;
  }

  initialize() {
    this.model.location = "stable-103";
  }

  getDescription() {
    let text = this.model.tr("description");
    if (this.model.isObjectiveCompleted("find-blueprints"))
      text += "<p" + this.model.tr("description-blueprints") + "</p>";
    if (this.model.isObjectiveCompleted("find-arm-module"))
      text += "<p>" + this.model.tr("description-arm-module") + "</p>";
    if (this.model.isObjectiveCompleted("craftDevice"))
      text += "<p>" + this.model.tr("description-crafted-" + this.model.getVariable("craftingBudddy")) + "</p>";
    if (this.model.isObjectiveCompleted("bringDevice"))
      text += "<p>" + this.model.tr("description-finished") + "</p>";
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
      this.model.completeObjective("explore-junkville-facility");
      break ;
    }
  }

  onCraftedCelestialDevice(withHelperSuffix) {
    this.model.setVariable("craftingBuddy", withHelperSuffix);
    game.player.inventory.addItemOfType("celestial-device");
    if (!this.model.hasObjective("craftDevice"))
      this.model.addObjective("craftDevice", this.tr("craft-celestial-device"));
    this.model.completeObjective("craftDevice");
    this.model.addObjective("bringDevice", this.tr("bring-celestial-device"));
  }

  onBroughtCelestialDevice() {
    game.player.inventory.removeItemOfType("celestial-device");
    if (!this.model.hasObjective("bringDevice"))
      this.model.addObjective("bringDevice", this.tr("bring-celestial-device"));
    this.model.completeObjective("bringDevice");
    this.model.completed = true;
    game.dataEngine.addReputation("stable-103", 150);
  }

  onQuestFollowup() {
    const rathian = game.getCharacter("rathian");
    if (rathian.isAlive()) {
      game.asyncAdvanceTime(11 * 60 + Math.ceil(Math.random() * 60), function() {
        game.quests.addQuest("stable-103/rathian");
      });
    } else {
      game.gameFinished();
    }
  }
}
