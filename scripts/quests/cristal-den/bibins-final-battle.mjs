import {QuestHelper} from "../helpers.mjs";
import inventoryCaravaneer from "../../equipments/caravaneers.mjs";
import inventorySlaver from "../../equipments/slavers.mjs";
import inventoryGuard from "../../equipments/cristal-den-guards.mjs";
import inventoryGoldenHerd from "../../equipments/golden-herd.mjs";
import inventoryBibinBand from "../../equipments/bibins-band.mjs";

const questName = "cristal-den/bibins-final-battle";

export function bibinFinalBattleOngoing() {
  const quest = game.quests.getQuest(questName);
  return quest && quest.getVariable("battleState") >= 1;
}

export function onExitBibinFinalBattle() {
  const quest = game.quests.getQuest(questName);

  if (quest.getVariable("battleState") == 1) {
    quest.script.attackers.forEach(attacker => attacker.takeDamage(attacker.statistics.hitPoints, null));
    quest.script.defenders
      .filter(defender => defender.isAlive())
      .forEach(defender => level.deleteObject(defender));
    quest.script.onBattleLost();
  } else {
    quest.script.attackers
      .filter(attacker => attacker.isAlive())
      .forEach(attacker => level.deleteObject(attacker));
  }
}

function attackerPartyData(quest) {
  const members = [];

  for (let i = 0 ; i < 3 ; ++i) {
    members.push({ sheet: "cristal-den/guard", inventory: inventoryGuard(i) });
  }
  if (quest.isObjectiveCompleted("recruitSlavers")) {
    members.push({ sheet: "cristal-den/slaver-A", inventory: inventorySlaver(1) });
    members.push({ sheet: "cristal-den/slaver-B", inventory: inventorySlaver(2) });
  }
  if (quest.isObjectiveCompleted("recruitCaravaneers")) {
    members.push({ sheet: "cristal-den/caravaneer-A", inventory: inventoryCaravaneer(1) });
    members.push({ sheet: "cristal-den/caravaneer-B", inventory: inventoryCaravaneer(2) });
  }
  members.forEach(member => { member.script = "cristal-den/bibins/final-battle-attacker.mjs"; });
  return { name: "potiok-fighters", members, faction: "player" };
}

function defenderPartyData() {
  const quest = game.quests.getQuest("cristal-den/bibins-rescue-herd");
  const members = [];

  for (let i = 0 ; i < 4 ; ++i) {
    members.push({ sheet: `cristal-den/bibins/guard-A`, inventory: inventoryBibinBand(i) });
  }
  if (!quest || quest.isObjectiveCompleted("rescue")) {
    for (let i = 0 ; i < 4 ; ++i) {
      members.push({ sheet: `golden-herd/warrior#${i + 1}`, inventory: inventoryGoldenHerd(i) });
    }
  }
  members.forEach(member => { member.script = "cristal-den/bibins/final-battle-defender.mjs"; });
  return { name: "bibin-fighters", members, faction: "bibins-band" };
}

export default class BibinsFinalBattle extends QuestHelper {
  initialize() {
    this.model.location = "cristal-den";
    this.model.addObjective("recruitSlavers", this.tr("recruitSlavers"));
    this.model.addObjective("recruitCaravaneers", this.tr("recruitCaravaneers"));
    this.model.addObjective("battle", this.tr("battle"));
  }

  get xpReward() {
    let xp = 1500;
    if (this.model.isObjectiveCompleted("recruitSlavers")) xp += 250;
    if (this.model.isObjectiveCompleted("recruitCaravaneers")) xp += 250;
    return xp;
  }

  get attackers() {
    return level.find(object => object.scriptName == "cristal-den/bibins/final-battle-attacker.mjs");
  }

  get defenders() {
    return level.find(object => object.scriptName == "cristal-den/bibins/final-battle-defender.mjs");
  }

  onSlaversRecruited() {
    this.model.completeObjective("recruitSlavers");
  }

  onCaravaneersRecruited() {
    this.model.completeObjective("recruitCaravaneers");
  }

  onCharacterKilled(character) {
    if (character.characterSheet == "cristal-den/bibin") {
      if (this.model.getVariable("battleState") == 1)
        this.onBattleWon();
      else
        this.model.failed = true;
    }
  }

  startBattle() {
    this.model.setVariable("battleState", 1);
    game.switchToLevel("cristal-den-slums", "bibin-final-battle-attackers", () => {
      console.log("SUCE LUI LE JAGON");
      const attackers = game.createNpcGroup(attackerPartyData(this.model));
      const defenders = game.createNpcGroup(defenderPartyData());

      level.insertPartyIntoZone(attackers, "bibin-final-battle-attackers");
      level.insertPartyIntoZone(defenders, "bibin-final-battle-defenders");
      game.diplomacy.setAsEnemy(true, "player", "bibins-band");
    });
  }

  onBattleWon() {
    this.model.setVariable("battleState", 2);
    this.model.completeObjective("battle");
    this.model.completed = true;
  }

  onBattleLost() {
    this.model.setVariable("battleState", 2);
    this.model.failObjective("battle");
    this.model.failed = true;
    game.dataEngine.addReputation(-100, "potioks");
  }
}
