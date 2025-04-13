import {Slave} from "./slave.mjs";
import {areGuardsAlive} from "../../quests/hillburrow/slaveRiot.mjs";

export class RainyPurple extends Slave {
  constructor(model) {
    super(model);
  }

  get dialog() {
    if (level.name == "hillburrow-backtown" && this.riotCompleted)
      return "hillburrow/rainy-purple";
    if (this.isAtWork && !this.expectingWeaponsForQuest)
      return "hillburrow/rainy-purple";
    if (this.isInPen)
      return "hillburrow/rainy-purple";
    return null;
  }

  get textBubbles() {
    if (this.expectingWeaponsForQuest && this.isAtWork)
      return [{content: i18n.t("bubbles.hillburrow.rainy-purple-talk-in-dorms"), duration: 5000}];
    return null;
  }

  get expectingWeaponsForQuest() {
    const quest = game.quests.getQuest("hillburrow/slaveRiot");

    return quest && quest.inProgress && !quest.isObjectiveCompleted("fetchWeapons");
  }

  get readyToRiot() {
    const quest = game.quests.getQuest("hillburrow/slaveRiot");

    return quest && quest.inProgress && quest.isObjectiveCompleted("fetchWeapons");
  }

  get riotCompleted() {
    const quest = game.quests.getQuest("hillburrow/slaveRiot");

    return (quest && quest.completed) || !areGuardsAlive();
  }

  get acquiredWeaponsCountForQuest() {
    let count = 0;

    this.model.inventory.find(item => { return item.category == "weapon"; }).forEach(item => {
      count += item.quantity;
    });
    return count;
  }

  get requiredWeaponsCountForQuest() {
    return level.findGroup("slaves").objects.length;
  }

  hasEnoughWeaponsForQuest() {
    return this.acquiredWeaponsCountForQuest >= this.requiredWeaponsCountForQuest;
  }

  triggerVendetta() {
    game.quests.addQuest("cristal-den/rainy-purple-vendetta").script.goToQuest();
  }
}
