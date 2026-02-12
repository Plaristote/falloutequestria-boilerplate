import HealerComponent from "./healer.mjs";

class Dialog {
  constructor(dialog) {
    this.dialog = dialog;
    this.healer = new HealerComponent(this);
  }

  get celestialDeviceQuest() {
    return game.quests.getQuest("celestialDevice");
  }

  getEntryPoint() {
    if (this.celestialDeviceQuest.completed && !this.dialog.npc.hasVariable("met2")) {
      this.dialog.npc.setVariable("met2", 1);
      this.dialog.npc.setVariable("met", 1);
      return "mainQuestThanks";
    }
    if (!this.dialog.npc.hasVariable("met")) {
      this.dialog.npc.setVariable("met", true);
      return "mainQuest";
    }
    return "entryPoint";
  }

  hasFoundBlueprints() {
    return this.celestialDeviceQuest.isObjectiveCompleted("find-blueprints");
  }

  hasCelestialDevice() {
    return game.player.inventory.count("celestial-device");
  }

  hasArmorBidAilments() {
    return game.player.statistics.perks.indexOf("armorBidAilments") >= 0
        || game.player.statistics.buffs.indexOf("armor-bid-treatment") >= 0;
  }

  cureArmorBidAilments() {
    const buff = game.player.getBuff("armor-bid-treatment");
    if (buff) buff.remove();
    game.player.statistics.togglePerk("armorBidAilments", false);
  }

  entryPoint() {
    if (this.introductionAnswer)
      return this.dialog.t(this.introductionAnswer);
  }

  mainQuestQuestion() {
    if (!this.celestialDeviceQuest.hasVariable("reportedBlueprints"))
      return this.dialog.t("introduction");
  }

  onAngry() {
    this.dialog.mood = "angry";
  }

  onMainQuestDone() {
    this.dialog.npc.setVariable("mainQuestDone", true);
  }

  onQuestDoneReassuring() {
    this.introductionAnswer = "introductionQuestReassuring";
  }
  
  onQuestDoneWorrying() {
    this.introductionAnswer = "introductionQuestWorrying";
  }

  onMainQuestNotDone() {
    this.introductionAnswer = "introductionQuestNotDone";
  }

  heal() {
    if (this.healer.heal(game.player))
      return "healedWounds";
    return "nothingToHeal";
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
