import {LevelBase} from "./base.mjs";
import {popPasserby} from "../characters/popping-passerby.mjs";

function prepareRainyPurpleVendetta() {
  const quest = game.quests.getQuest("cristal-den/rainy-purple-vendetta");

  if (quest && quest.inProgress) {
    quest.script.start();
  }
}

export class CristalDenCenter extends LevelBase {
  initialize() {
    level.tasks.addUniqueTask("passerbyTick", 28912, 0);
  }

  onLoaded() {
    prepareRainyPurpleVendetta();
  }

  passerbyTick() {
    const randomValue = Math.random() * 3;
    const now = Date.now();

    if (randomValue > 2 && (!this.lastPasserby || (this.lastPasserby + 28) > now)) {
      this.lastPasserby = now;
      popPasserby({
        popZones: ["cristal-den-entrance", "cristal-den-rld", "cristal-den-slums"],
        buildings: ["shop", "weapon-shop", "clinic"],
        characterOptions: ["cristal-den/caravaneer-A", "cristal-den/caravaneer-B", "cristal-den/guard"],
        generateInventory: function(inventory) {
          inventory.addItemOfType("bottlecaps", Math.ceil(Math.random() * 50));
        }
      });
    }
  }
}
