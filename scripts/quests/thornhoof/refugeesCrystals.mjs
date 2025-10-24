import {QuestHelper, Flag} from "../helpers.mjs";

export const Flags = {
  ShamanTalkedTo: 1,
  ShamanConvinced: 2,
  PlayerConvinced: 4,
  ShamanCooperating: 8,
  ShamanRefusal: 16,
  ShamanIntimidated: 32,
  CounselorKnowsAboutCrystalMagic: 64,
  CrystalsStolen: 128
};

function extractCrystalsFromCharacter(character, max = 999) {
  const count = Math.min(max, character.inventory.count("crystal-companion"));
  character.inventory.removeItemOfType("crystal-companion", count);
  return count;
}

function extractCrystalsFromRefugees(max = 999) {
  const refugees = level.find("tents.*").filter(o => o.type === "Character");
  let count = 0;

  refugees.forEach(refugee => {
    if (max > count)
      count = extractCrystalsFromCharacter(refugee, max - count);
  });
  return count;
}

export default class extends QuestHelper {
  constructor(model) {
    super(model);
    this.Flags = Flags;
    this.flags = new Flag(model);
  }

  get xpReward() {
    let base = 1250;
    if (this.flags.has(Flags.PlayerConvinced))
      base /= 2;
    if (this.talkedAboutCrystalMagic)
      base += 50;
    if (this.flags.has(Flags.ShamanCooperating))
      base += 250;
    if (this.flags.has(Flags.CounselorKnowsAboutCrystalMagic))
      base += 75;
    return base;
  }

  initialize() {
    this.model.location = "thornhoof";
    this.model.addObjective("investigate-refugees");
  }

  getDescription() {
    let text = this.model.tr("description");

    if (this.flags.has(Flags.ShamanTalkedTo))
      text += `<p>${this.model.tr("desc-talked-shaman")}</p>`;
    if (this.flags.has(Flags.ShamanConvinced)) {
      if (this.flags.has(Flags.ShamanIntimidated)) {
        text += `<p>${this.model.tr("desc-shaman-convinced")}</p>`;
      } else {
        text += `<p>${this.model.tr("desc-shaman-intimidated")}</p>`;
      }
    } else if (this.flags.has(Flags.PlayerConvinced)) {
      text += `<p>${this.model.tr("desc-player-convinced")}</p>`;
    } else if (this.flags.has(Flags.ShamanCooperating)) {
      text += `<p>${this.model.tr("desc-shaman-cooperating")}</p>`;
    }
    return text;
  }

  retrieveCrystals() {
    let limit = 999;
    let found = 0;

    if (this.flags.has(Flags.ShamanCooperating))
      limit = 5;
    if (this.flags.has(Flags.CrystalsStolen))
      found += extractCrystalsFromCharacter(game.player);
    if (this.flags.has(Flags.ShamanCooperating | Flags.ShamanConvinced))
      found += extractCrystalsFromRefugees(limit);
    this.retrievedCrystals = found;
  }

  get retrievedCrystals() {
    return this.model.getVariable("retrievedCrystals", 0);
  }

  set retrievedCrystals(value) {
    this.model.setVariable("retrievedCrystals", value);
  }

  get fullReward() {
    return this.crystalReward * this.retrievedCrystals;
  }

  get crystalReward() {
    return parseInt(this.model.getVariable("crystalReward", 25));
  }

  set crystalReward(value) {
    this.model.setVariable("crystalReward", value);
  }

  get negociatedWithShaman() {
    return this.flags.has(Flags.ShamanConvinced | Flags.PlayerConvinced | Flags.ShamanCooperating);
  }

  get canStartCrystalsTalkWithShaman() {
    return this.model.inProgress && !this.negociatedWithShaman;
  }

  get talkedAboutCrystalMagic() {
    return this.model.hasVariable("crystalMagic");
  }

  onTalkedWithShaman() {
    this.model.completeObjective("investigate-refugees");
    this.flags.add(Flags.ShamanTalkedTo);
  }

  onTalkedAboutCrystalMagic() {
    this.model.setVariable("crystalMagic", 1);
  }

  onShamanDebateEnded(flag) {
    this.flags.add(flag);
    this.model.completeObjective("talkToShaman");
    if (this.negociatedWithShaman)
      this.model.addObjective("report-leaf");
  }

  completeObjective(objective) {
    switch (objective) {
      case "report-leaf":
        this.model.completed = true;
        break ;
    }
  }

  onSuccess() {
    super.onSuccess();
    if (this.flags.has(Flags.PlayerConvinced)) {
      game.dataEngine.addReputation("thornhoof-refugees", 30);
      game.dataEngine.addReputation("thornhoof", -15);
    } else if (this.flags.has(Flags.ShamanConvinced)) {
      game.dataEngine.addReputation("thornhoof-refugees", -15);
      game.dataEngine.addReputation("thornhoof", 20);
    } else if (this.flags.has(Flags.ShamanCooperating)) {
      game.dataEngine.addReputation("thornhoof-refugees", 5);
      game.dataEngine.addReputation("thornhoof", 5);
    } else {
      game.dataEngine.addReputation("thornhoof-refugees", -20);
      game.dataEngine.addReputation("thornhoof", 20);
    }
  }
}
