import {getValueFromRange} from "../random.mjs";
import {generateHostileEncounter} from "../../worldmap/hostileEncounters.mjs";
import {generateEncounterLevel} from "../../worldmap/encounterLevels.mjs";
import inventorySlaver from "../../equipments/slavers.mjs";

// The slave convoy the player can escort from Crystal Den to Hillburrow
// (quest cristal-den/slavers-errand). It works like the caravan
// (caravan.mjs): the party is kept off-level between encounters, the world
// map advances by steps, and every step ends in a hostile encounter that the
// escort party is inserted into.
//
// Differences with the caravan:
//  - the party has slaves, who never fight, and a few slaver guards;
//  - what matters is how many slaves reach Hillburrow, not who else lives;
//  - leaving a fight while slaves are still alive is desertion.
const partyName = "slave-convoy";
const slaveSheets = ["cristal-den/slave-A", "cristal-den/slave-B"];
const guardSheets = ["cristal-den/slaver-A", "cristal-den/slaver-B"];
const questName = "cristal-den/slavers-errand";

export const slaveCount = 10;
export const guardCount = 3;

function isSlave(character) {
  return character.scriptName == "cristal-den/slavers/convoy-slave.mjs";
}

function isInConvoy(character) {
  return character.objectName.indexOf(partyName) == 0;
}

function convoyPath() {
  return ["cristal-den", "hillburrow"];
}

function positionForPathPoint(point) {
  return typeof point == "string" ? game.worldmap.getCity(point).position : point;
}

export default class SlaveConvoyProcess {
  get variableStore() {
    return game;
  }

  get errandQuest() {
    return game.quests.getQuest(questName);
  }

  get hasCaravan() {
    return this.inProgress;
  }

  get inProgress() {
    return this.variableStore.getVariable("slaveConvoyInProgress", 0) == 1;
  }

  set inProgress(value) {
    if (value)
      this.variableStore.setVariable("slaveConvoyInProgress", 1);
    else
      this.variableStore.unsetVariable("slaveConvoyInProgress");
  }

  get totalEncounters() {
    return this.variableStore.getVariable("slaveConvoyEncounterCount", 0);
  }

  set totalEncounters(value) {
    this.variableStore.setVariable("slaveConvoyEncounterCount", value);
  }

  get currentEncounter() {
    return this.variableStore.getVariable("slaveConvoyEncounterAt", 0);
  }

  set currentEncounter(value) {
    this.variableStore.setVariable("slaveConvoyEncounterAt", value);
  }

  get aliveSlaves() {
    if (!this.party)
      return [];
    return this.party.list.filter(character => isSlave(character) && character.isAlive());
  }

  get hostileEncounterOver() {
    if (this.currentEncounter > 0 && typeof level != "undefined")
      return !level.combat;
    return true;
  }

  // BEGIN Lifecycle
  // Called by the slavers' boss dialog once the player has agreed to escort the convoy.
  startConvoy() {
    this.inProgress = true;
    this.totalEncounters = getValueFromRange(2, 3);
    this.currentEncounter = 0;
    game.exitLevel(function() {});
  }

  onConvoyStarted() {
    this.party = this.createParty();
    this.triggerNextEncounter();
  }

  onGameLoaded() {
    this.loadParty();
  }

  onExitingLevel() {
    if (this.party)
      this.party.extractFromLevel(level);
    if (!this.party)
      this.onConvoyStarted();
    else if (this.aliveSlaves.length === 0)
      this.onConvoyFailure("wiped");
    else if (this.hostileEncounterOver)
      this.triggerNextEncounter();
    else
      this.onConvoyFailure("deserted");
  }

  triggerNextEncounter() {
    this.currentEncounter++;
    if (this.currentEncounter > this.totalEncounters) {
      this.onConvoyArrived();
      return ;
    }
    game.asyncAdvanceTime(60 * getValueFromRange(25, 60), () => {
      this.updateWorldmapPosition();
      this.onHostileEncounter();
    });
  }

  updateWorldmapPosition() {
    const path = convoyPath();
    const from = positionForPathPoint(path[0]);
    const to = positionForPathPoint(path[1]);
    const ratio = this.currentEncounter / (this.totalEncounters + 1);

    game.worldmap.currentPosition.x = from.x + (to.x - from.x) * ratio;
    game.worldmap.currentPosition.y = from.y + (to.y - from.y) * ratio;
    game.worldmap.targetPosition = game.worldmap.currentPosition;
  }

  onHostileEncounter() {
    const parties = generateHostileEncounter();

    game.randomEncounters.startEncounter(generateEncounterLevel(), {
      title: "slave-convoy-attack",
      parties: parties,
      callback: () => {
        level.insertPartyIntoZone(this.party, "encounter-zone-2");
      }
    });
  }

  onConvoyArrived() {
    const survivors = this.aliveSlaves.length;
    const quest = this.errandQuest;

    // Same order as the ghoul expedition: change location first, then clean up.
    game.switchToCity("hillburrow");
    this.finish();
    if (quest)
      quest.script.onConvoyArrived(survivors);
  }

  onConvoyFailure(reason) {
    const quest = this.errandQuest;

    this.finish();
    if (quest)
      quest.script.onConvoyFailed(reason);
  }

  // Dead convoy members are removed from the party's list, but their bodies are
  // still attached to the level (and still children of the party object). The
  // party is deleted while the level is still ticking (we get here from
  // onExitingLevel, and the level lives on for a moment): deleting the party
  // would free those bodies under the level's feet and crash its next update.
  // Remove them from the level first.
  discardBodiesFromLevel() {
    if (typeof level == "undefined" || !this.party)
      return ;
    const living = this.party.list;

    level.find(isInConvoy).forEach(character => {
      if (living.indexOf(character) < 0)
        level.deleteObject(character);
    });
  }

  finish() {
    this.discardBodiesFromLevel();
    this.inProgress = false;
    this.totalEncounters = 0;
    this.currentEncounter = 0;
    if (this.party)
      this.deleteParty();
  }

  // BEGIN Party management
  partyData(members = null) {
    if (members === null) {
      members = [];
      for (let i = 0 ; i < guardCount ; ++i)
        members.push({ sheet: guardSheets[i % 2], inventory: inventorySlaver(i) });
      for (let i = 0 ; i < slaveCount ; ++i)
        members.push({ sheet: slaveSheets[i % 2], script: "cristal-den/slavers/convoy-slave.mjs" });
    }
    return { name: partyName, members: members, faction: "cristal-den-slavers" };
  }

  createParty() {
    return this.party = game.createNpcGroup(this.partyData());
  }

  loadParty() {
    if (!this.party && typeof level != "undefined")
      this.party = game.createNpcGroup(this.partyData(level.find(isInConvoy)));
    return this.party;
  }

  deleteParty() {
    game.deleteNpcGroup(this.party);
    this.party = null;
  }
}
