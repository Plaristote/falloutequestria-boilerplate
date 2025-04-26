import {DialogHelper, SkillAnswer, BarterAnswer} from "../../helpers.mjs";
import {skillContest} from "../../../cmap/helpers/checks.mjs";

const defaultCelestialDevicePrice = 500;

export default class extends DialogHelper {
  constructor(dialog) {
    super(dialog);
    this.playerUnderstandsGenerator = SkillAnswer.multiple(dialog, "understandsGenerator", ["repair", "science"]);
    this.celestialDevicePriceBarter = (new BarterAnswer(this.dialog, "celestialDevice"))
      .setSkillLimit(70).setXpReward(75);
    this.canNegociateCelestialDevicePrice = this.celestialDevicePriceBarter.visibilityCallback;
    this.celestialDeviceNegociatePrice    = this.celestialDevicePriceBarter.triggerCallback;
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

  celestialDeviceIntroduction() {
    const mainQuest = game.quests.getQuest("celestialDevice");
    if (!mainQuest.hasObjective("find-arm-module"))
      mainQuest.addObjective("find-arm-module", mainQuest.script.tr("find-arm-module"));
    console.log("celestialDeviceIntroduction CALLED with last answer", this.dialog.previousAnswer)
    switch (this.dialog.previousAnswer) {
      case "ask-suggestion-celestial-device-arm":
        mainQuest.setVariable("ombrageLabHint", 1);
        return { textKey: "celestial-device/arm-location-suggestion" };
      case "boast-about-already-having-arm":
        return { textKey: "celestial-device/arm-already-found", mood: "laugh" };
    }
  }

  celestialDeviceAlreadyFoundArm() {
    const mainQuest = game.quests.getQuest("celestialDevice");
    return mainQuest.isObjectiveCompleted("isObjectiveCompleted");
  }

  canShowCelestialDevicePlans() {
    return game.player.inventory.count("celestial-device-blueprints") && this.dialog.npc.getVariable("celestialDeviceState", 0) < 1;
  }

  canClaimCelestialDeviceParts() {
    return this.dialog.npc.getVariable("celestialDeviceState", 0) === 1;
  }

  celestialDeviceStartWorking() {
    const target = game.timeManager.getTimestamp() + game.timeManager.secondsUntilTime({ "weeks": 1, "hour": 0 });
    this.dialog.npc.setVariable("celestialDeviceTime", target);
    this.dialog.npc.setVariable("celestialDeviceState", 1);
  }

  celestialDevicePartsReady() {
    return this.dialog.npc.hasVariable("celestialDeviceTime")
        && this.dialog.npc.getVariable("celestialDeviceTime") <= game.timeManager.getTimestamp();
  }

  celestialPartsClaim() {
    console.log("RUNNING CELESTIAL PARTS CLAIM", this.celestialDevicePartsReady());
    if (this.celestialDevicePartsReady()) {
      this.dialog.npc.setVariable("celestialDeviceState", 2);
      return "celestial-device/give-parts";
    }
  }

  get celestialDevicePartsPrice() {
    return this.celestialDevicePriceBarter.passed ? 250 : 500;
  }

  celestialDeviceNegociateCraftParts() {
    switch (this.dialog.previousAnswer) {
      case "negociate-celestial-device-price":
        return this.celestialDevicePriceBarter.passed
          ? { textKey: "celestial-device/negociate-craft-part-bartered", mood: "dubious" }
          : { textKey: "celestial-device/negociate-craft-parts-bartered-failed", mood: "angry" };
    }
  }

  celestialDeviceCanPayPrice() {
    return game.player.inventory.count("bottlecaps") >= this.celestialDevicePartsPrice;
  }

  celestialDevicePayPrice() {
    game.player.inventory.removeItemOfType("bottlecaps", this.celestialDevicePartsPrice);
    this.dialog.npc.inventory.addItemOfType("bottlecaps", this.celestialDevicePartsPrice);
  }

  celestialDeviceAskToCraft() {
    const reputation = game.dataEngine.getReputation("ash-aven");
    return reputation >= 100 ? "celestial-device/accept-craft-parts" : "celestial-device/negociate-craft-parts";
  }

  isRepairTrainingAvailable() {
    return !this.dialog.npc.hasVariable("trained-with");
  }

  canTrainRepair() {
    return game.player.statistics.repair > 50;
  }

  learnRepair() {
    const maxTraining = this.dialog.npc.statistics.repair - game.player.statistics.repair;
    const trainingValue = Math.min(15, maxTraining);

    game.appendToConsole(i18n.t("messages.training", { skill: i18n.t("cmap.repair"), amount: trainingValue }));
    game.player.statistics.repair += trainingValue;
    game.asyncAdvanceTime(240, () => {
      this.dialog.npc.setVariable("trained-with", 1);
    });
  }

  hasElectromagicSpinel() {
    return game.player.inventory.count("electromagic-spinel") > 0;
  }

  get crystalReward() {
    return 200;
  }

  onSpinelWhereabouts() {
    if (!this.spinelQuest)
      game.quests.addSpinel("capital/find-spinel", 2);
    this.spinelQuest.steelRangersHint = true;
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
