import {DialogHelper, SkillAnswer} from "../../helpers.mjs";

export default class extends DialogHelper {
  constructor(dialog) {
    super(dialog);
    this.playerUnderstandsGenerator = SkillAnswer.multiple(dialog, "understandsGenerator", ["repair", "science"]);
  }

  get spinelQuest() {
    return game.quests.getQuest("capital/find-spinel");
  }

  getEntryPoint() {
    if (!this.spinelQuest) {
      this.firstMeeting = this.firstMeetingCheck();
      return "introduction";
    } else if (!this.spinelQuest.completed) {
      return "crystal/prompt";
    }
    return "entry";
  }

  hasElectromagicSpinel() {
    return game.player.inventory.count("electromagic-spinel") > 0;
  }

  get crystalReward() {
    return 200;
  }

  onSpinelTakeQuest() {
    if (!this.spinelQuest)
      game.quests.addQuest("capital/find-spinel");
  }

  onSpinelGive() {
    game.player.inventory.removeItemOfType("electromagic-spinel");
    if (!this.spinelQuest)
      game.quests.addQuest("capital/find-spinel");
    this.spinelQuest.completeObjective("give-spinel");
  }

  onSpinelThanks() {
    this.onSpinelGive();
    game.dataEngine.addReputation("ash-aven", 100);
  }

  onSpinelReward() {
    this.onSpinelGive();
    game.dataEngine.addReputation("ash-aven", 50);
    game.player.inventory.addItemOfType("bottlecaps", this.crystalReward);
  }

  introduction() {
    return { textKey: this.firstMeeting ? "introduction" : "intro/alt" };
  }
}
