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
      const elapsedTime = game.timeManager.getTimestamp() - game.getVariable("startedAt");
      this.dialog.npc.setVariable("met", true);
      this.introduction = elapsedTime < 20 * 24 * 60 * 60;
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

  entryPoint() {
    if (this.introductionAnswer)
      return this.dialog.t(this.introductionAnswer);
  }
  
  mainQuestQuestion() {
    if (this.introduction)
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
