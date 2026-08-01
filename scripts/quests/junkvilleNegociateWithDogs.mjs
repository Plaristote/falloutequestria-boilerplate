import {QuestHelper, requireQuest} from "./helpers.mjs";
import killArray from "../characters/killArray.mjs";
import {
  isLookingForDisappearedPonies,
  hasFoundDisappearedPonies,
  onDisappearedPoniesFound,
  captiveReleaseAuthorized,
  areCaptorsDead,
  skipScavengerRansom
} from "./junkvilleDumpsDisappeared.mjs";
import {junkvilleCombattantTemplate} from "./junkville/helpers.mjs";
import {getValueFromRange} from "../behaviour/random.mjs";

const questName = "junkvilleNegociateWithDogs";

function hasQuest() { return game.quests.hasQuest(questName); }
function getQuest() { return game.quests.getQuest(questName); }

export const NEGOTIATE_FIDO_ARGUMENT_FLAGS = [
  "fidoDebateUsedHelp",
  "fidoDebateUsedBandits",
  "fidoDebateUsedFuture"
];

// Randy's side of the same kind of debate: he also needs two solid
// reasons before he'll agree to entertain talks with the pack.
export const NEGOTIATE_RANDY_ARGUMENT_FLAGS = [
  "randyDebateUsedScavengers",
  "randyDebateUsedBandits",
  "randyDebateUsedSafety"
];

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

// The pack's two open wounds - the injured dogs, and the captive scavengers
// - must both be closed before either Fido or Randy will even entertain the
// idea of negotiating. Both sides gate their half of the conversation on
// this same precondition.
export function canDiscussPeaceWithDogs() {
  const scavengerQuest = game.quests.getQuest("junkvilleDumpsDisappeared");
  return !!scavengerQuest
      && scavengerQuest.isObjectiveCompleted("healWoundedDogs")
      && scavengerQuest.isObjectiveCompleted("save-captives");
}

// Fido agreeing to entertain negotiation at all. Kept under the same name
// as before since shouldAltLeaderTakeOver() and Randy's script both already
// depend on it meaning exactly this.
export function startMediation() {
  const quest = requireQuest(questName);
  quest.completeObjective("fido-agreed-to-negotiate");
}

export function hasMediationStarted() {
  return hasQuest() && getQuest().isObjectiveCompleted("fido-agreed-to-negotiate");
}

// Randy independently agreeing to entertain negotiation.
export function hasRandyAgreedToNegotiate() {
  return hasQuest() && getQuest().isObjectiveCompleted("randy-agreed-to-negotiate");
}

// Only once BOTH sides have separately bought into the idea of negotiating
// - in whichever order the player approached them - does it become possible
// to start bringing up what each side actually wants.
export function bothAgreedToNegotiate() {
  return hasMediationStarted() && hasRandyAgreedToNegotiate();
}

// Whether Fido has been won over on the specific question of letting
// Junkville trade for the tunnels' gems - this is what lets Randy's own
// debate end in a full trade agreement rather than a bare boundary line.
export function fidoAcceptedTradeOfGems() {
  return hasQuest() && getQuest().isObjectiveCompleted("fido-accepted-trade");
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

export function startUndergroundBattle() {
  skipScavengerRansom();
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

// Dolly's betrayal: once Fido has committed to negotiating with the surface
// (mediation started) and nobody has talked her down, killed her, or already
// triggered this takeover, leaving the caverns hands control of the pack to
// her the next time the player comes back. This is checked on every level
// exit, but internalPackIssueDone() flips true as soon as it fires once
// (via the "alt-leader-took-over" objective), so it only actually happens
// the first time the conditions line up.
export function shouldAltLeaderTakeOver() {
  return hasQuest()
      && hasMediationStarted()
      && !internalPackIssueDone()
      && !hasBattleStarted();
}

export function hasAltLeaderTakenOver() {
  return hasQuest() &&
         getQuest().isObjectiveCompleted("alt-leader-took-over");
}

export function makeAltLeaderTakeOver() {
  requireQuest(questName).completeObjective("alt-leader-took-over");
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

  get dogsDebatePoints() {
    return NEGOTIATE_FIDO_ARGUMENT_FLAGS.filter(flag => this.model.hasVariable(flag)).length;
  }

  get randyDebatePoints() {
    return NEGOTIATE_RANDY_ARGUMENT_FLAGS.filter(flag => this.model.hasVariable(flag)).length;
  }

  onCharacterKilled(character) {
    switch (character.characterSheet) {
      case "junkville-dog-leader": this.model.setVariable("leaderDead", 1); break ;
      case "junkville-dog-second":
        this.model.setVariable("altLeaderDead", 1);
        getQuest().completeObjective("alt-leader-dead");
        break ;
    }
    if (areCaptorsDead())
      this.model.completed = true;
  }

  getDescription() {
    let text = `<p>${this.model.tr("desc-intro")}</p>`;

    if (!this.model.isObjectiveCompleted("safe"))
      return text;
    text += `<p>${this.model.tr("desc-safe")}</p>`;

    if (canDiscussPeaceWithDogs()) {
      if (bothAgreedToNegotiate())
        text += `<p>${this.model.tr("desc-both-agreed")}</p>`;
      else if (hasMediationStarted())
        text += `<p>${this.model.tr("desc-fido-agreed-only")}</p>`;
      else if (hasRandyAgreedToNegotiate())
        text += `<p>${this.model.tr("desc-randy-agreed-only")}</p>`;
    }
    if (bothAgreedToNegotiate()) {
      if (fidoAcceptedTradeOfGems())
        text += `<p>${this.model.tr("desc-trade-accepted")}</p>`;
      else if (this.model.hasVariable("fidoTradeLocked"))
        text += `<p>${this.model.tr("desc-trade-refused")}</p>`;
    }
    if (internalPackIssueDone()) {
      if (this.model.isObjectiveCompleted("alt-leader-convinced"))
        text += `<p>${this.model.tr("desc-dolly-convinced")}</p>`;
      else if (this.model.isObjectiveCompleted("alt-leader-dead"))
        text += `<p>${this.model.tr("desc-dolly-dead")}</p>`;
    }
    if (bothAgreedToNegotiate() && this.model.isObjectiveCompleted("pass-on-message"))
      text += `<p>${this.model.tr("desc-message-passed")}</p>`;
    if (this.model.isObjectiveCompleted("assembly-participate"))
      text += `<p>${this.model.tr("desc-assembly-attended")}</p>`;
    if (bothAgreedToNegotiate() && this.model.hasVariable("passOnJunkvilleDecision")) {
      text += this.model.getVariable("passOnJunkvilleDecision") == 2
        ? `<p>${this.model.tr("desc-decision-passed")}</p>`
        : `<p>${this.model.tr("desc-decision-pending")}</p>`;
    }
    if (bothAgreedToNegotiate() && this.model.isObjectiveCompleted("peaceful-resolve")) {
      text += this.model.getVariable("mediation") === "trade"
        ? `<p>${this.model.tr("desc-peace-trade")}</p>`
        : `<p>${this.model.tr("desc-peace-boundary")}</p>`;
    }

    if (internalPackIssueDone() && this.model.isObjectiveCompleted("alt-leader-took-over"))
      text += `<p>${this.model.tr("desc-dolly-took-over")}</p>`;
    else if (this.model.hasVariable("leaderDead"))
      text += `<p>${this.model.tr("desc-fido-dead")}</p>`;

    if (hasBattleStarted()) {
      if (this.model.getVariable("escaped", false))
        text += `<p>${this.model.tr("desc-battle-fled")}</p>`;
      if (this.model.isObjectiveCompleted("win-battle"))
        text += `<p>${this.model.tr("desc-battle-won")}</p>`;
      else if (this.model.isObjectiveCompleted("lose-battle"))
        text += `<p>${this.model.tr("desc-battle-lost")}</p>`;
      else
        text += `<p>${this.model.tr("desc-battle-ongoing")}</p>`;
    } else if (areCaptorsDead()) {
      text += `<p>${this.model.tr("desc-dogs-wiped-out")}</p>`;
    }

    return text;
  }

  getObjectives() {
    const objectives = [];

    objectives.push({
      label: this.tr("save-yourself-from-the-diamond-dogs"),
      success: this.model.isObjectiveCompleted("safe")
    });
    if (canDiscussPeaceWithDogs()) {
      objectives.push({
        label: this.tr("convince-fido-to-negotiate"),
        success: this.model.isObjectiveCompleted("fido-agreed-to-negotiate"),
        failure: !this.model.isObjectiveCompleted("fido-agreed-to-negotiate") && (hasBattleStarted() || this.leadersDead)
      });
      objectives.push({
        label: this.tr("convince-randy-to-negotiate"),
        success: this.model.isObjectiveCompleted("randy-agreed-to-negotiate")
      });
    }
    if (bothAgreedToNegotiate()) {
      objectives.push({
        label: this.tr("convince-fido-to-trade"),
        success: this.model.isObjectiveCompleted("fido-accepted-trade"),
        failure: this.model.hasVariable("fidoTradeLocked")
      });
    }
    if (internalPackIssueDone()) {
      objectives.push({
        label: this.tr("solve-pack-unrest"),
        success: this.model.isObjectiveCompleted("alt-leader-convinced") || this.model.isObjectiveCompleted("alt-leader-dead"),
        failure: this.model.isObjectiveCompleted("alt-leader-took-over")
      });
    }
    if (bothAgreedToNegotiate()) {
      objectives.push({
        label: this.tr("pass-on-message"),
        success: this.model.isObjectiveCompleted("pass-on-message")
      });
    }
    if (this.model.isObjectiveCompleted("assembly-participate")) {
      objectives.push({
        label: this.tr("assembly-participate"),
        success: true
      });
    }
    if (bothAgreedToNegotiate() && this.model.hasVariable("passOnJunkvilleDecision")) {
      objectives.push({
        label: this.tr("pass-on-assembly-decision"),
        success: this.model.getVariable("passOnJunkvilleDecision") == 2
      });
    }
    if (bothAgreedToNegotiate()) {
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
        game.appendToConsole(i18n.t("junkville.escape-from-dogs-success", { xp: 100 }));
        game.player.statistics.addExperience(100);
        break ;
      case "peaceful-resolve":
      case "win-battle":
        this.model.completed = true;
        break ;
      case "lose-battle":
        this.model.failed = true;
        break ;
    }
  }

  onSuccess() {
    if (this.model.isObjectiveCompleted("win-battle"))
      game.appendToConsole(i18n.t("junkville-dog-mediation.win-battle"));
    super.onSuccess();
  }
}
