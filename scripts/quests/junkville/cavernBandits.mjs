import {QuestHelper, QuestFlags, requireQuest} from "../helpers.mjs";
import {junkvilleCombattantTemplate} from "./helpers.mjs";
import killArray from "../../characters/killArray.mjs";

const questName = "junkville/cavernBandits";

function hasQuest() { return game.quests.hasQuest(questName); }
function getQuest() { return game.quests.getQuest(questName); }

export function hasCavernBanditsQuest() {
  return hasQuest();
}

export function onEnteredBanditsCavern() {
  const quest = requireQuest(questName, QuestFlags.HiddenQuest);
  if (!quest.isObjectiveCompleted("locate-nest"))
    quest.script.pushUniqueEvent("find-nest");
}

export function nestLocationKnown() {
  return hasQuest() && getQuest().isObjectiveCompleted("locate-nest");
}

export function nestLocationReportedToRandy() {
  return hasQuest() && getQuest().isObjectiveCompleted("report-nest");
}

export function canReportNestLocationToRandy() {
  return nestLocationKnown() && !nestLocationReportedToRandy() && getQuest().script.talkedWithRandy;
}

export function banditsCleared() {
  return hasQuest() && getQuest().isObjectiveCompleted("remove-bandits");
}

export function banditsResolution() {
  return hasQuest() ? getQuest().getVariable("raidersResolution") : undefined;
}

// Used to see if Fido should trust ponies in the negotiating part
export function banditsDefeatedWithJunkvilleHelp() {
  return banditsResolution() === "junkville-help";
}

export function reportedToLeader() {
  return hasQuest() && getQuest().isObjectiveCompleted("reported-to-leader");
}

export function reportedToRandy() {
  return hasQuest() && getQuest().isObjectiveCompleted("reported-to-randy");
}

export function hasNegociatedBanditsReward() {
  return hasQuest() && getQuest().getVariable("randyReward", 0) > 0;
}

export function randyShouldReprimandAboutFleeingBanditBattle() {
  return hasQuest()
    && getQuest().script.hasEvent("raid-ran-away")
    && getQuest().getVariable("randyJoining")
    && !getQuest().hasVariable("ranAwayTalkedWithRandy");
}

//
// BANDIT RAID
// 
export function hasBanditsRaidStarted() {
  return hasQuest() && getQuest().hasVariable("raidState");
}

export function startBanditsRaidWithRandy() {
  const quest = requireQuest(questName);
  quest.setVariable("raidState", 1);
  quest.setVariable("randyJoining", true);
  game.setVariable("junkvilleBanditsRaid", true);
  level.tasks.addTask("goToBanditsRaid", 1500, 1);
}

export function startBanditsRaidSolo() {
  const quest = requireQuest(questName);
  quest.setVariable("raidState", 1);
  quest.setVariable("randyJoining", false);
  game.setVariable("junkvilleBanditsRaid", true);
  level.tasks.addTask("goToBanditsRaid", 1500, 1);
}

export function sendDogReinforcement() {
  const quest = requireQuest(questName);
  quest.setVariable("dogsJoining", true);
}

export function initializeBanditsRaid() {
  const quest = requireQuest(questName);
  const cook = game.uniqueCharacterStorage.getCharacter("junkville-cook");

  game.diplomacy.setAsEnemy(true, "player", "cavern-bandits");
  if (quest.getVariable("randyJoining")) {
    quest.script.pushEvent("raid-with-junkville");
    game.diplomacy.setAsEnemy(true, "junkville", "bandits");
    game.diplomacy.setAsEnemy(true, "player", "bandits");
    const junkvilleNpcs = level.createNpcGroup({
      name: "junkville",
      members: [
        junkvilleCombattantTemplate(1, "cavern-combattant"),
        junkvilleCombattantTemplate(2, "cavern-combattant"),
        junkvilleCombattantTemplate(3, "cavern-combattant"),
        junkvilleCombattantTemplate(4, "cavern-combattant"),
      ]
    });
    if (cook) {
      game.uniqueCharacterStorage.loadCharacterToCurrentLevel("junkville-cook", 0, 0);
      junkvilleNpcs.addCharacter(cook);
      cook.setScript("junkville/cook-cavern-combat.mjs");
    }
    junkvilleNpcs.insertIntoZone(level, "bandits-camp-entry");
  } else if (quest.getVariable("dogsJoining")) {
    quest.script.pushEvent("raid-with-dogs");
    game.diplomacy.setAsEnemy(true, "diamond-dogs", "cavern-bandits");
    const npcs = level.createNpcGroup({
      name: "diamond-dogs",
      members: [
        // TODO
      ]
    })
    npcs.insertIntoZone(level, "bandits-camp-entry");
  }
}

// options: { survivors: { bandits, junkville, dogs } }
export function finalizeBanditsRaid(options) {
  const quest = requireQuest(questName);
  const { survivors, victory } = options;
  const randyJoined = quest.getVariable("randyJoining");
  const dogsJoined  = quest.getVariable("dogsJoining");

  if (quest.getVariable("raidState", 0) === 2)
    return ;

  quest.setVariable("raidState", 2);
  quest.completeObjective("remove-bandits");

  // Ran away before the end of the raid
  if (survivors.bandits.length > 0) {
    quest.script.pushEvent("raid-ran-away");
    if (randyJoined)
      game.dataEngine.addReputation("junkville", -60);
    if (dogsJoined)
      game.dataEngine.addReputation("diamond-dogs", -60);
  }
  // Won with junkville, dogs or alone (last one not needed ?)
  if (victory) {
    if (randyJoined) {
      quest.setVariable("raidersResolution", "junkville-help");
      game.dataEngine.addReputation("junkville", 40);
      quest.script.pushEvent("victory-with-junkville");
    } else if (dogsJoined) {
      quest.setVariable("raidersResolution", "dogs-help");
      game.dataEngine.addReputation("diamond-dogs", 40);
      quest.script.pushEvent("victory-with-dogs");
    } else {
      quest.setVariable("raidersResolution", "player-solo");
      quest.script.pushEvent("victory-solo");
    }
    game.dataEngine.addReputation("junkville", 20);
    game.dataEngine.addReputation("diamond-dogs", 20);
  } else {
    if (randyJoined)
      quest.script.pushEvent("defeat-junkville");
    else if (dogsJoined)
      quest.script.pushEvent("defeat-dogs");
    else
      quest.script.pushEvent("defeat-solo");
  }
  console.log("DONE with finalizeBanditsRaid DONE");
}

export function clearBanditsRaid(options) {
  const quest = requireQuest(questName);
  const cook = game.getCharacter("junkville-cook");

  if (!options.victory) {
    console.log("Defeat, killing survivors");
    killArray(options.survivors.junkville);
    killArray(options.survivors.dogs);
  } else {
    console.log("Victory, killing bandits and deleting temporary combattants");
    killArray(options.survivors.bandits);
    options.survivors.dogs.forEach(character => { level.deleteObject(character); });
    options.survivors.junkville.forEach(character => {
      if (character != cook)
        level.deleteObject(character);
    });
  }
  if (cook.isAlive())
    game.uniqueCharacterStorage.detachCharacter(cook);
}

export function onBanditsWipedOutIndependently() {
  const quest = getQuest();
  if (!quest || quest.isObjectiveCompleted("remove-bandits"))
    return;
  quest.completeObjective("remove-bandits");
  quest.script.pushUniqueEvent("victory-solo");
  if (!quest.hasVariable("raidersResolution"))
    quest.setVariable("raidersResolution", "player-solo");
}
//
// END BANDIT RAID
//

export default class JunkvilleCavernBandits extends QuestHelper {
  initialize() {
    this.model.location = "junkville";
  }

  get xpReward() {
    return 1200;
  }

  get talkedWithDogs() {
    return this.hasEvent("given-by-dogs") || this.hasEvent("talked-with-dogs");
  }

  get talkedWithRandy() {
    return this.hasEvent("given-by-cook") || this.hasEvent("talked-with-cook");
  }

  pushEvent(name) {
    super.pushEvent(name);
    if (name === "given-by-dogs" || name === "talked-with-dogs" || name == "find-nest")
      this.model.completeObjective("locate-nest");
  }

  getDescription() {
    let html = "";

    this.events.forEach(event => {
      html += "<p>" + this.tr(`desc-${event}`) + "</p>";
    });
    return html;
  }

  getObjectives() {
    const objectives = [];

    objectives.push({
      label: this.tr("locate-nest"),
      success: this.model.isObjectiveCompleted("locate-nest")
    });
    if (this.model.isObjectiveCompleted("locate-nest") && this.talkedWithRandy) {
      objectives.push({
        label: this.tr("report-nest"),
        success: this.model.isObjectiveCompleted("report-nest")
      });
    }
    if (this.model.isObjectiveCompleted("report-nest") || this.talkedWithDogs) {
      objectives.push({
        label: this.tr("remove-bandits"),
        success: this.model.isObjectiveCompleted("remove-bandits")
      });
    }
    if (this.model.isObjectiveCompleted("remove-bandits")) {
      if (this.talkedWithDogs || this.model.isObjectiveCompleted("reported-to-leader")) {
        objectives.push({
          label: this.tr("reported-to-leader"),
          success: this.model.isObjectiveCompleted("reported-to-leader")
        });
      }
      if (this.talkedWithRandy || this.model.isObjectiveCompleted("reported-to-randy")) {
        objectives.push({
          label: this.tr("reported-to-randy"),
          success: this.model.isObjectiveCompleted("reported-to-randy"),
          failed: !game.getCharacter("junkville-cook").isAlive()
        });
      }
    }
    return objectives;
  }

  completeObjective(name, success) {
    if (!success) return ;
    if ((name === "reported-to-leader" && this.hasEvent("given-by-dogs")) ||
        (name === "reported-to-randy" && this.hasEvent("given-by-cook")) ||
        (name === "remove-bandits" && this.hasEvent("given-by-cook") && !game.getCharacter("junkville-cook").isAlive())
    ) {
      this.model.completed = true;
    }
  }

  onCompleted() {
    super.onCompleted();
    game.dataEngine.addReputation("junkville", 25);
    game.dataEngine.addReputation("diamond-dogs", 25);
  }
}
