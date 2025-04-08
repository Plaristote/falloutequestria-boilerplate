import {QuestHelper, requireQuest} from "./helpers.mjs";
import {
  isLookingForDisappearedPonies,
  hasFoundDisappearedPonies,
  onDisappearedPoniesFound,
  captiveReleaseAuthorized,
  areCaptorsDead
} from "./junkvilleDumpsDisappeared.mjs";
import {getValueFromRange} from "../behaviour/random.mjs";

const questName = "junkvilleNegociateWithDogs";

function hasQuest() { return game.quests.hasQuest(questName); }
function getQuest() { return game.quests.getQuest(questName); }

export function safeObjectiveCompleted() {
  if (hasQuest())
    getQuest().completeObjective("safe");
}

export function mediationNeedsCaptiveRelease() {
  let result = false;
  if (!hasFoundDisappearedPonies())
    console.log(questName, "-> mediationNeedsCaptiveRelease: player is not yet aware about captives.");
  else if (hasQuest() && getQuest().getVariable("mustReleaseDogs") === true)
    result = !captiveReleaseAuthorized();
  console.log(questName, "-> mediationNeedsCaptiveRelease?", result);
  return result;
}

export function startMediation(type) {
  const quest = requireQuest("junkvilleNegociateWithDogs");
  quest.setVariable("mediation", 1);
}

export function hasMediationStarted() {
  return hasQuest() && getQuest().hasVariable("mediation");
}

export function hasBattleStarted() {
  return hasQuest() && getQuest().hasVariable("battleState");
}

export function allowedInCaverns() {
  const quest = getQuest();
  return !quest || !quest.isObjectiveCompleted("peaceful-resolve") || quest.getVariable("mediation") == "trade";
}

export function prepareDiamondDogsOnCavernAccessTransgression() {
  const dogs  = level.getScriptObject().liveDiamondDogs;
  const dolly = level.findObject("dog-alt-leader");

  if (!allowedInCaverns()) {
    const quest = requireQuest(questName);

    dogs.splice(2);
    if (dolly.isAlive()) dogs.push(dolly);
    dogs.forEach(dog => { level.moveCharacterToZone(dog, "battle-entry")});
    game.diplomacy.setAsEnemy(true, "diamond-dogs", "junkville");
    game.diplomacy.setAsEnemy(true, "diamond-dogs", "player");
    quest.setVariable("battle-forced", 1);
  }
}

function junkvilleCombattantTemplate() {
  const capsCount = getValueFromRange(0, 31);
  const ammoCount = getValueFromRange(12, 28);
  let items = [];
  let slots = {};

  items.push({ itemType: "9mm-ammo", quantity: ammoCount });
  if (capsCount > 0)
    items.push({ itemType: "bottlecaps", quantity: capsCount });
  slots["use-1"] = { hasItem: true, itemType: "mouthgun", ammo: 6, maxAmmo: 6 };
  return {
    sheet: "junkville-combattant",
    script: "junkville/underground-combattant.mjs",
    inventory: {
      items: items,
      slots: slots
    }
  };
}

export function startUndergroundBattle() {
  requireQuest(questName).setVariable("battleState", 1);
  game.setVariable("junkvilleUndergroundBattle", true);
  level.tasks.addTask("goToUndergroundBattle", 1500, 1);
}

export function initializeBattle() {
  const cook = game.uniqueCharacterStorage.getCharacter("junkville-cook");
  let junkvilleNpcs;
  game.diplomacy.setAsEnemy(true, "junkville", "diamond-dogs");
  game.diplomacy.setAsEnemy(true, "player", "diamond-dogs");
  junkvilleNpcs = level.createNpcGroup({
    name: "junkville",
    members: [
      junkvilleCombattantTemplate(1),
      junkvilleCombattantTemplate(2),
      junkvilleCombattantTemplate(3),
      junkvilleCombattantTemplate(4)
    ]
  });
  if (cook) {
    game.uniqueCharacterStorage.loadCharacterToCurrentLevel("junkville-cook", 0, 0);
    junkvilleNpcs.addCharacter(cook);
    cook.setScript("junkville/cook-underground-combat.mjs");
  }
  junkvilleNpcs.insertIntoZone(level, "battle-entry");
  if (level.script.liveCaptives.length > 0)
    onDisappearedPoniesFound();
  level.script.liveCaptives.forEach(captive => {
    captive.tasks.addUniqueTask("reachExitZone", 1500, 0);
  });
}

function killArray(array) {
  array.forEach(character => {
    character.takeDamage(character.statistics.hitPoints, null);
  });
}

export function finalizeBattle(options) {
  const quest = requireQuest(questName);
  const { survivors, escaping } = options;

  quest.setVariable("battleState", 2);
  if (escaping) {
    quest.setVariable("escaped", true);
    game.dataEngine.addReputation("junkville", -60);
  } else {
    game.dataEngine.addReputation("junkville", 60);
  }
  if (survivors.dogs.length > survivors.junkville.length) {
    console.log("-> dogs won");
    game.setVariable("junkvilleBattleCookDied", 1);
    quest.completeObjective("lose-battle");
    killArray(survivors.captives);
    killArray(survivors.junkville);
  } else {
    console.log("-> junkville won");
    killArray(survivors.dogs);
    quest.completeObjective("win-battle");
    game.dataEngine.addReputation("junkville", 35);
  }
}

export function clearBattle(options) {
  const quest = requireQuest(questName);

  if (quest.getVariable("battleState") !== 2) {
    finalizeBattle({
      escaping: true,
      survivors: options.survivors
    });
  }
  if (quest.isObjectiveCompleted("win-battle")) {
    survivors.captives.forEach(character => {
      character.script.onSaved();
    });
    survivors.junkville.forEach(character => {
      level.deleteObject(character);
    });
  }
}

export function internalPackIssueDone() {
  if (hasQuest()) {
    const quest = getQuest();
    return quest.isObjectiveCompleted("alt-leader-convinced")
        || quest.isObjectiveCompleted("alt-leader-dead")
        || quest.isObjectiveCompleted("alt-leader-took-over");
  }
  return false;
}

export function shouldAltLeaderTakeOver() {
  return hasQuest() && !internalPackIssueDone() && captiveReleaseAuthorized();
}

export function hasAltLeaderTakenOver() {
  return hasQuest() &&
         getQuest().isObjectiveCompleted("alt-leader-took-over");
}

export function makeAltLeaderTakeOver() {
  requireQuest(questName).completeObjective("alt-leader-took-over");
  game.diplomacy.setAsEnemy(true, "diamond-dogs", "player");
  game.diplomacy.setAsEnemy(true, "diamond-dogs", "junkville");
}

export function hasSupplyRequestObjective() {
  const quest = requireQuest("junkvilleDumpsDisappeared");
  return quest.script.ransomActive || quest.script.suppliesRequested;
}

export class JunkvilleNegociateWithDogs extends QuestHelper {
  initialize() {
    this.model.location = "junkville";
  }
  
  get xpReward() {
    if (this.model.isObjectiveCompleted("win-battle"))
      return 1450;
    return 750;
  }

  get leadersDead() {
    return this.model.hasVariable("leadersDead") && this.model.hasVariable("altLeaderDead");
  }

  onCharacterKilled(character) {
    switch (character.characterSheet) {
      case "junkville-dog-leader": this.model.setVariable("leaderDead", 1); break ;
      case "junkville-dog-second": this.model.setVariable("altLeaderDead", 1); break ;
    }
  }

  getObjectives() {
    const objectives = [];

    objectives.push({
      label: this.tr("save-yourself-from-the-diamond-dogs"),
      success: this.model.isObjectiveCompleted("safe")
    });
    if (hasSupplyRequestObjective()) {
      objectives.push({
        label: this.tr("bring-medical-supplies"),
        success: this.model.isObjectiveCompleted("bring-medical-supplies"),
        failure: !this.model.isObjectiveCompleted("bring-medical-supplies") && (hasBattleStarted() || this.leadersDead)
      });
    }
    if (internalPackIssueDone()) {
      objectives.push({
        label: this.tr("solve-pack-unrest"),
        success: this.model.isObjectiveCompleted("alt-leader-convinced") || this.model.isObjectiveCompleted("alt-leader-dead"),
        failure: this.model.isObjectiveCompleted("alt-leader-took-over")
      });
    }
    if (hasMediationStarted()) {
      objectives.push({
        label: this.tr("peaceful-resolve"),
        success: this.model.isObjectiveCompleted("peaceful-resolve"),
        failure: !this.model.isObjectiveCompleted("peaceful-resolve") && hasBattleStarted()
      });
    }
    if (hasBattleStarted()) {
      objectives.push({
        label: this.tr("win-battle"),
        success: this.model.isObjectiveCompleted("win-battle"),
        failure: this.model.isObjectiveCompleted("lose-battle")
      });
    } else if (areCaptorsDead()) {
      objectives.push({ label: this.tr("wipe-out-dogs"), success: true });
    }
    return objectives;
  }

  completeObjective(objective, success) {
    if (!success) return ;
    switch (objective) {
      case "safe":
        game.appendToConsole(i18n.t("junkville.escape-from-dogs-success"));
        game.player.statistics.addExperience(100);
        break ;
      case "peaceful-resolve":
      case "win-battle":
        this.model.completed = true;
        break ;
      case "lose-battle":
        this.model.completed = this.model.failed = true;
        break ;
    }
  }

  onSuccess() {
    if (this.model.isObjectiveCompleted("win-battle"))
      game.appendToConsole(i18n.t("junkville-dog-mediation.win-battle"));
    super.onSuccess();
  }
}
