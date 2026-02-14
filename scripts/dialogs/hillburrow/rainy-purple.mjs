import {DialogHelper} from "../helpers.mjs";
import {areDenSlaversDead} from "../../characters/cristal-den/slavers/denSlaversDead.mjs";
import {requireQuest} from "../../quests/helpers.mjs";

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
    requireQuest("hillburrow/slaveRiot").script.addPenRendezvous();
  }

  addRiotQuest() {
    requireQuest("hillburrow/slaveRiot").script.addRiotPlans();
  }

  onGiveWeapons() {
    this.dialog.barterStarted();
  }

  afterGiveWeapons() {
    const quest = game.quests.getQuest("hillburrow/slaveRiot");

    quest.script.broughtWeapons = this.acquiredWeaponsCount;
    if (this.hasQuestWeapons()) {
      quest.completeObjective("fetchWeapons");
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
    game.quests.getQuest("hillburrow/slaveRiot").script.startRiot();
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
