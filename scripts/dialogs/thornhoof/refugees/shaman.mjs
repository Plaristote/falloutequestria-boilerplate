import {requireQuest, QuestFlags} from "./../../../quests/helpers.mjs";
import {multipleSkillCheck, skillCheck} from "./../../../cmap/helpers/checks.mjs";

class Dialog {
  constructor(dialog) {
    this.dialog = dialog;
  }

  knowsAboutCrystalMagic() {
    return this.crystalsQuest && this.crystalsQuest.talkedAboutCrystalMagic;
  }

  gaveStolenCrystalForDemo() {
    game.dataEngine.addReputation("basalburg-refugees", -25);
    game.player.inventory.removeItemOfType("crystal-companion");
    this.dialog.npc.inventory.addItemOfType("crystal-companion");
  }

  hasCrystalCompanion() {
    return game.player.inventory.count("crystal-companion") > 0;
  }

  /*
   * Refugees Crystal Quest
   */
  get crystalsQuest() {
    return game.quests.getQuest("thornhoof/refugeesCrystals");
  }

  get crystalsQuestFlags() {
    return this.crystalsQuest?.script?.Flags;
  }

  canStartCrystalsTalk() {
    return this.crystalsQuest?.script?.canStartCrystalsTalkWithShaman;
  }

  canConvinceCrystalsTalk() {
    return game.player.statistics.speech >= 75;
  }

  canConvinceCooperate() {
    return this.canConvinceCrystalsTalk && this.knowsAboutCrystalMagic;
  }

  learnedAboutCrystalsHealing() {
    const quest = requireQuest("thornhoof/refugeesCrystals", QuestFlags.HiddenQuest);
    quest.script.onTalkedAboutCrystalMagic();
  }

  crystalsQuestTalked() {
    this.crystalsQuest.script.onTalkedWithShaman();
  }

  crystalsQuestConvince() {
    this.crystalsQuest.script.onShamanDebateEnded(this.crystalsQuestFlags.ShamanConvinced);
  }

  crystalsQuestCooperate() {
    this.crystalsQuest.script.onShamanDebateEnded(this.crystalsQuestFlags.ShamanCooperating);
  }

  crystalsQuestConvinced() {
    this.crystalsQuest.script.onShamanDebateEnded(this.crystalsQuestFlags.PlayerConvinced);
  }

  crystalsQuestRefusal() {
    this.crystalsQuest.script.onShamanDebateEnded(this.crystalsQuestFlags.ShamanRefusal);
  }

  crystalsQuestIntimidated() {
    this.crystalsQuest.script.flags.add(this.crystalsQuestFlags.ShamanIntimidated);
  }

  crystalsQuestIntimidateCheck() {
    const success = multipleSkillCheck(game.player, ["strength", "charisma"], {
      dice: 5,
      target: 10
    })
    return "about-crystals/intimidation/" + (success ? "success" : "failure");
  }

  get crystalsQuestIntimidateSpeechSucess() {
    if (this._cqiss === undefined)
      this._cqiss = skillCheck(game.player, "speech");
    return this._cqiss;
  }

  crystalsQuestIntimidateSpeechCheck() {
    return "about-crystals/intimidation/speech-"
      + (this.crystalsQuestIntimidateSpeechSuccess ? "success" : "failure");
  }

  crystalsQuestIntimidateSpeechText() {
    return this.dialog.t(
      "about-crystals/intimidated/answer002" +
      (this.crystalsQuestIntimidateSpeechSuccess ? "" : "-fail")
    );
  }

  get crystalsQuestHelpedRefugees() {
    return this.crystalsQuest.script.flags.has(this.crystalsQuestFlags.PlayerConvinced);
  }

  /*
   * Refugees Fight Quest
   */
  get fightQuest() {
    return game.quests.getQuest("thornhoof/refugeesFight");
  }

  canStartWoundedPonyTalk() {
    if (this.fightQuest && this.fightQuest.isObjectiveCompleted("interrogate-shaman"))
      return false;
    return this.fightQuest.script.woundedDetected > 0;
  }

  woundedPonyAlreadyDetected() {
    return this.fightQuest.script.woundedDetected > 1;
  }

  woundedPonyCanSkipConvincing() {
    return game.player.statistics.speech >= 80;
  }

  woundedPonyLearnAboutFriends() {
    this.fightQuest.script.learnAboutHideout = "shaman";
  }

  woundedPonyLearnAboutWounded() {
    this.fightQuest.script.woundedDetected = 2;
  }

  woundedPonyStart() {
    this.fightQuest.completeObjective("interrogate-shaman");
  }

  woundedPonyTryConvinceTellOnWounded() {
    if (this.crystalsQuestHelpedRefugees)
      return "about-wounded/path-1#2-success";
    return "about-wounded/path-1#2-failure-alt";
  }

  woundedPonyTryConvinceTellOnWoundedAlt() {
    let threshold = 80;

    if (this.crystalsQuestHelpedRefugees)
      threshold = 50;
    return game.player.statistics.speech >= threshold
      ? "about-wounded/path-1#2-success-alt"
      : "about-wounded/path-1#2-failure-alt";
  }

  woundedPonyTriConvinceTellOnWoudedAlt2() {
    if (this.crystalsQuestHelpedRefugees)
      return "about-wounded/path-1#2-success";
    return "about-wounded/P1A8-failure";
  }

  woundedPonyTryConvinceFairTrial() {
    if (this.crystalsQuestHelpedRefugees)
      return "about-wounded/convinced";
    return "about-wounded/thornhoof-justice-fail";
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
