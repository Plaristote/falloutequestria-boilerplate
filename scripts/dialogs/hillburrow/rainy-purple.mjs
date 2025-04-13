import {DialogHelper} from "../helpers.mjs";
import {areDenSlaversDead} from "../../characters/cristal-den/slavers/denSlaversDead.mjs";

class Dialog extends DialogHelper {
  getEntryPoint() {
    if (this.npcScript.riotCompleted)
      return "after-riot/entry";
    if (this.npcScript.expectingWeaponsForQuest)
      return "quest-prompt";
    if (this.npcScript.readyToRiot)
      return "quest-riot-prompt";
    if (this.npcScript.isInPen) {
      if (this.dialog.npc.hasVariable("proposed-help"))
        return "at-pen/introduced";
      return "at-pen/entry";
    }
    return "at-work/entry";
  }

  onCalledGuards() {
    const guard = level.findObject("guards.slave-guards.mercenary#1");

    game.dataEngine.addReputation("hillburrow-slaves", -15);
    guard.getScriptObject().beatSlave(this.dialog.npc);
  }

  onProposedToHelp() {
    this.dialog.npc.setVariable("proposed-help", 1);
  }

  addRiotQuest() {
    game.quests.addQuest("hillburrow/slaveRiot");
  }

  onGiveWeapons() {
    this.dialog.barterStarted();
  }

  afterGiveWeapons() {
    if (this.hasQuestWeapons()) {
      game.quests.getQuest("hillburrow/slaveRiot").completeObjective("fetchWeapons");
      return "quest-riot-prompt";
    }
    return "quest-not-enough-weapons";
  }

  hasQuestWeapons() {
    return this.requiredWeaponsCount <= this.acquiredWeaponsCount;
  }

  get requiredWeaponsCount() {
    return this.npcScript.requiredWeaponsCountForQuest;
  }

  get acquiredWeaponsCount() {
    return this.npcScript.acquiredWeaponsCountForQuest;
  }

  startRiot() {
    game.quests.getQuest("hillburrow/slaveRiot").getScriptObject().startRiot();
  }

  triggerVendetta() {
    this.dialog.npc.tasks.addUniqueTask("triggerVendetta", 150, 1);
  }

  areDenSlaversAlreadyDead() {
    return areDenSlaversDead();
  }

  areDenSlaversStillAlive() {
    return !this.areDenSlaversAlreadyDead();
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
