import {getValueFromRange} from "../random.mjs";
import {generateEncounterLevel} from "../../worldmap/encounterLevels.mjs";

const expeditionPartyName = "ghoul-hunter-expedition";

function isCharacterInExpedition(character) {
  return character.characterSheet.indexOf(expeditionPartyName) == 0
      || character.characterSheet.indexOf("caravan-leader") == 0;
}

function positionForPathPoint(point) {
  return typeof point == "string"
    ? game.worldmap.getCity(point).position
    : point;
}

function expeditionPath() {
  return ["cristal-den", { x: 1500, y: 640 }, { x: 1900, y: 750 }];
}

function ghoulPartyMembers(difficultyRoll) {
  return [
    { "sheet": "capital/feral-ghoul-1", "script": "feral-ghoul.mjs", "amount": 2 + Math.ceil(difficultyRoll / 23) },
    { "sheet": "capital/feral-ghoul-2", "script": "feral-ghoul.mjs", "amount": 2 + Math.ceil(difficultyRoll / 18) }
  ];
}

function ghoulParty(difficultyRoll) {
  return { "name": "Feral Ghouls", "avoidRoll": 70 + difficultyRoll / 4, "members": ghoulPartyMembers(difficultyRoll) };
}

function roachParty(difficultyRoll) {
  return {
    "name": "Roaches",
    "avoidRoll": 80 + difficultyRoll / 4,
    "members": [
      { "sheet": "roach", "script": "roach.mjs", "amount": 3 + Math.ceil(difficultyRoll / 20) },
      { "sheet": "roach-big", "script": "roach.mjs", "amount": Math.ceil(difficultyRoll / 33) }
    ]
  };
}

function shadowGhoulParty(difficultyRoll) {
  return {
    "name": "Ghoul Pack",
    "avoidRoll": 90 + difficultyRoll / 4,
    "members": [
      { "sheet": "capital/feral-ghoul-1", "script": "feral-ghoul.mjs", "amount": 2 + Math.ceil(difficultyRoll / 20) },
      { "sheet": "capital/feral-ghoul-2", "script": "feral-ghoul.mjs", "amount": 2 + Math.ceil(difficultyRoll / 20) },
      { "sheet": "capital/shadow-pony", "script": "capital/shadow-pony.mjs", "amount": 1 }
    ]
  };
}

function isHostile(character) {
  if (character.characterSheet) {
    return character.characterSheet.indexOf("capital/feral-ghoul") == 0
        || character.characterSheet.indexOf("capital/shadow-pony") == 0;
  }
  return false;
}

export default class GhoulHunterExpeditionProcess {
  tr(key, options = {}) {
    return i18n.t(`quests.${this.questName}.${key}`, options);
  }

  get questName() {
    return "cristal-den/ghoulExpedition";
  }

  get variableStore() {
    return game;
  }

  get hasCaravan() {
    return this.inProgress;
  }

  get inProgress() {
    return this.variableStore.getVariable("expeditionInProgress", 0) == 1;
  }

  set inProgress(value) {
    if (value)
      this.variableStore.setVariable("expeditionInProgress", 1);
    else
      this.variableStore.unsetVariable("expeditionInProgress");
  }

  get pendingReward() {
    return this.variableStore.getVariable("expeditionReward", 0);
  }

  set pendingReward(value) {
    if (value)
      this.variableStore.setVariable("expeditionReward", value);
    else
      this.variableStore.unsetVariable("expeditionReward");
  }

  get totalEncounters() {
    return this.variableStore.getVariable("expeditionEncounterCount", 0);
  }

  set totalEncounters(value) {
    if (value)
      this.variableStore.setVariable("expeditionEncounterCount", value);
    else
      this.variableStore.unsetVariable("expeditionEncounterCount");
  }

  get currentEncounter() {
    return this.variableStore.getVariable("expeditionEncounterAt", 0);
  }

  set currentEncounter(value) {
    if (value)
      this.variableStore.setVariable("expeditionEncounterAt", value);
    else
      this.variableStore.unsetVariable("expeditionEncounterAt");
  }

  get difficultySequence() {
    if (this.variableStore.hasVariable("expeditionDifficulties"))
      return JSON.parse(this.variableStore.getVariable("expeditionDifficulties"));
    return null;
  }

  set difficultySequence(value) {
    if (value)
      this.variableStore.setVariable("expeditionDifficulties", JSON.stringify(value));
    else
      this.variableStore.unsetVariable("expeditionDifficulties");
  }

  get failedExpeditionCount() {
    return this.variableStore.getVariable("failedExpeditionCount", 0);
  }

  set failedExpeditionCount(value) {
    this.variableStore.setVariable("failedExpeditionCount", value);
  }

  get hostileEncounterOver() {
    if (this.currentEncounter > 0 && typeof level != "undefined")
      return !this.hasConsciousGhouls();
    return true;
  }

  hasConsciousGhouls() {
    if (typeof level == "undefined")
      return false;
    return level.find(
      character => isHostile(character) && character.unconscious == false
    ).length > 0;
  }

  get xpReward() {
    return 1750;
  }

  get expeditionRewardAmount() {
    return 500;
  }

  get escortMembersCount() {
    return 4;
  }

  get laurieCharacter() {
    return game.getCharacter("cristal-den/caravan-leader");
  }

  // How much of the escort (Laurie included) is still alive - used by the
  // caravan-leader dialog to pick her reaction while an expedition is
  // mid-way, and to gate the "let's retreat" option.
  get aliveRatio() {
    if (!this.party || this.party.list.length === 0)
      return 1;
    const aliveCount = this.party.list.filter(character => character.isAlive()).length;
    return aliveCount / this.party.list.length;
  }

  get moraleTier() {
    if (this.aliveRatio <= 0.25)
      return "grim";
    if (this.aliveRatio <= 0.5)
      return "doubtful";
    return "confident";
  }

  // BEGIN Lifecycle
  startExpedition() {
    this.inProgress = true;
    this.totalEncounters = getValueFromRange(3, 4);
    this.difficultySequence = this.generateDifficultySequence(this.totalEncounters);
    this.currentEncounter = 0;
    game.exitLevel(function() {});
  }

  onExpeditionStarted() {
    this.variableStore.unsetVariables(["abandonnedExpedition", "wipedOutExpedition"]);
    this.party = this.createExpeditionParty();
    this.triggerNextEncounter();
  }

  onGameLoaded() {
    this.loadExpeditionParty();
  }

  onExitingLevel() {
    game.uniqueCharacterStorage.detachCharacter(this.laurieCharacter);
    if (this.party)
      this.party.extractFromLevel(level);
    if (!this.party)
      this.onExpeditionStarted();
    else if (this.hostileEncounterOver && this.party.list.length > 0)
      this.triggerNextEncounter();
    else
      this.onExpeditionFailure();
  }

  // BEGIN Expedition
  generateDifficultySequence(count) {
    const finalDifficulty = getValueFromRange(70, 100);
    const ascending = Math.random() < 0.5;
    const difficulties = [];

    for (let i = 0 ; i < count - 1 ; ++i)
      difficulties.push(getValueFromRange(20, Math.max(20, finalDifficulty - 5)));
    difficulties.sort((a, b) => ascending ? a - b : b - a);
    difficulties.push(finalDifficulty);
    return difficulties;
  }

  currentDifficultyRoll() {
    const sequence = this.difficultySequence;
    return sequence ? sequence[this.currentEncounter - 1] : getValueFromRange(20, 100);
  }

  isFinalEncounter() {
    return this.currentEncounter >= this.totalEncounters;
  }

  generateEncounterParties() {
    const isFinal = this.isFinalEncounter();
    const difficultyRoll = this.currentDifficultyRoll();
    const parties = isFinal
      ? [ghoulParty(difficultyRoll), shadowGhoulParty(difficultyRoll)]
      : [ghoulParty(difficultyRoll)];

    if (!isFinal && getValueFromRange(0, 1) == 1)
      parties.push(roachParty(difficultyRoll));
    for (let i = 0 ; i < parties.length ; ++i)
      parties[i].zone = `encounter-zone-${i + 1}`;
    return parties;
  }

  triggerNextEncounter() {
    this.currentEncounter++;
    if (this.currentEncounter > this.totalEncounters) {
      this.onExpeditionComplete();
      return ;
    }
    game.asyncAdvanceTime(60 * getValueFromRange(20, 45), () => {
      this.updateWorldmapPosition();
      this.onHostileEncounter();
    });
  }

  updateWorldmapPosition() {
    const path = expeditionPath();
    const start = positionForPathPoint(path[0]);
    const end = positionForPathPoint(path[1]);
    const outboundCount = Math.ceil(this.totalEncounters / 2);
    let ratio;
    let from, to;

    if (this.currentEncounter <= outboundCount) {
      from = start;
      to = end;
      ratio = this.currentEncounter / outboundCount;
    } else {
      const returnCount = this.totalEncounters - outboundCount;
      from = end;
      to = start;
      ratio = (this.currentEncounter - outboundCount) / returnCount;
    }
    game.worldmap.currentPosition.x = from.x + (to.x - from.x) * ratio;
    game.worldmap.currentPosition.y = from.y + (to.y - from.y) * ratio;
    game.worldmap.targetPosition = game.worldmap.currentPosition;
  }

  onHostileEncounter() {
    const parties = this.generateEncounterParties();

    game.randomEncounters.startEncounter(generateEncounterLevel(), {
      title: "ghoul-hunter-expedition-attack",
      parties: parties,
      callback: this.onHostileEncounterStarted.bind(this)
    });
  }

  onHostileEncounterStarted() {
    const isFinal = this.isFinalEncounter();
    const laurie = this.laurieCharacter;
    const line = (key) => this.tr(`bubbles.${key}`);

    level.insertPartyIntoZone(this.party, "encounter-zone-2");
    if (laurie)
      level.addTextBubble(laurie, line("encounter-line"), 4000, "white");
    if (isFinal) {
      const shadowPony = level.find(object => object.characterSheet === "capital/shadow-pony")[0];
      if (shadowPony) {
        shadowPony.statistics.faction = "critters";
        if (laurie) {
          laurie.lookAt(shadowPony);
          level.addTextBubble(laurie, line("shadow-pony-line"), 4000, "yellow");
          this.variableStore.setVariable("expeditionDebriefPending", 1);
        }
      }
    }
  }

  onExpeditionComplete() {
    const path = expeditionPath();

    game.worldmap.currentPosition = positionForPathPoint(path[0]);
    game.worldmap.targetPosition = game.worldmap.currentPosition;
    game.switchToCity("cristal-den");
    game.playerParty.addExperience(this.xpReward);
    game.appendToConsole(this.tr("messages.expedition-completed", { xp: this.xpReward }));
    this.pendingReward += this.expeditionRewardAmount;
    this.inProgress = false;
    this.totalEncounters = 0;
    this.currentEncounter = 0;
    this.difficultySequence = null;
    this.deleteExpeditionParty();
  }

  // Called when the player agrees with Laurie's suggestion to turn back
  // mid-expedition. Not a failure (no failedExpeditionCount bump, no
  // ranaway/wipedout framing) - just postponed to another day, empty-handed.
  abortExpedition() {
    const path = expeditionPath();

    this.inProgress = false;
    this.totalEncounters = 0;
    this.currentEncounter = 0;
    this.difficultySequence = null;
    this.deleteExpeditionParty();
    game.worldmap.currentPosition = positionForPathPoint(path[0]);
    game.worldmap.targetPosition = game.worldmap.currentPosition;
    game.switchToCity("cristal-den");
  }

  onExpeditionFailure() {
    const remainingEscort = this.party.list.length;

    this.inProgress = false;
    this.totalEncounters = 0;
    this.currentEncounter = 0;
    this.difficultySequence = null;
    this.failedExpeditionCount++;
    this.deleteExpeditionParty();
    if (remainingEscort === 0)
      this.variableStore.setVariable("wipedOutExpedition", 1);
    else
      this.variableStore.setVariable("abandonnedExpedition", 1);
  }

  // BEGIN Party Management
  expeditionPartyData(members = null) {
    if (members === null) {
      members = [];
      members.push(this.laurieCharacter);
      for (let i = 0 ; i < this.escortMembersCount ; ++i) {
        const characterSheet = i % 2 == 0 ? "cristal-den/caravaneer-A" : "cristal-den/caravaneer-B";
        members.push({
          "sheet": characterSheet,
          "inventory": i % 3 == 0 ? inventoryFighter : inventoryShooter
        });
      }
    }
    return {
      "name": expeditionPartyName,
      "members": members,
      "faction": "cristal-den"
    };
  }

  createExpeditionParty() {
    return this.party = game.createNpcGroup(this.expeditionPartyData());
  }

  loadExpeditionParty() {
    if (!this.party && typeof level != "undefined") {
      const members = level.find(isCharacterInExpedition);

      if (members.indexOf(this.laurieCharacter) < 0)
        members.push(this.laurieCharacter);
      this.party = game.createNpcGroup(this.expeditionPartyData(members));
    }
    return this.party;
  }

  deleteExpeditionParty() {
    game.deleteNpcGroup(this.party);
    this.party = null;
  }
}

// Duplicated from caravan.mjs, but TODO they need to be tougher.
const inventoryFighter = {
  "items": [
    {
      "animation": "misc",
      "float": false,
      "itemType": "9mm-ammo",
      "objectName": "9mm-ammo",
      "quantity": 24,
      "spriteName": "items",
      "useMode": "",
    }
  ],
  "slots": {
    "armor": {
      "animation": "metal-armor",
      "float": false,
      "hasItem": true,
      "itemType": "metal-armor",
      "mtx": 0,
      "mty": 0,
      "nextX": 0,
      "nextY": 0,
      "objectName": "metal-armor",
      "quantity": 1,
      "rx": 0,
      "ry": 0,
      "slotType": "armor",
      "spriteName": "items",
      "useMode": "use",
      "x": -1,
      "y": -1
    },
    "saddle": {
      "hasItem": false,
      "slotType": "saddle"
    },
    "use-2": {
      "animation": "mouthgun",
      "hasItem": true,
      "itemType": "mouthgun",
      "ammo": 10,
      "objectName": "mouthgun",
      "quantity": 1,
      "slotType": "any",
      "spriteName": "items",
      "useMode": "use"
    },
    "use-1": {
      "hasItem": true,
      "itemType": "combat-knife",
      "objectName": "combat-knife",
      "quantity": 1,
      "slotType": "any",
      "spriteName": "items",
      "useMode": "use"
    }
  }
};

const inventoryShooter = {
  "items": [
    {
      "animation": "misc",
      "blocksPath": false,
      "float": false,
      "itemType": "223-ammo",
      "mtx": 0,
      "mty": 0,
      "nextX": 0,
      "nextY": 0,
      "objectName": "223-ammo",
      "quantity": 30,
      "rx": 0,
      "ry": 0,
      "spriteName": "items",
      "useMode": "",
      "x": -1,
      "y": -1
    }
  ],
  "slots": {
    "armor": {
      "hasItem": false,
      "slotType": "armor"
    },
    "saddle": {
      "hasItem": false,
      "slotType": "saddle"
    },
    "use-1": {
      "animation": "mouthgun",
      "hasItem": true,
      "itemType": "hunting-rifle",
      "ammo": 10,
      "objectName": "hunting-rifle",
      "quantity": 1,
      "slotType": "any",
      "spriteName": "items",
      "useMode": "use"
    },
    "use-2": {
      "hasItem": true,
      "itemType": "combat-knife",
      "objectName": "combat-knife",
      "quantity": 1,
      "slotType": "any",
      "spriteName": "items",
      "useMode": "use"
    }
  }
};
