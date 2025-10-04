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
}

export function create(dialog) {
  return new Dialog(dialog);
}
