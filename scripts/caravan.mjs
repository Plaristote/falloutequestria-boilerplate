import {isJinxed, getValueFromRange} from "./behaviour/random.mjs";
import {generateHostileEncounter} from "worldmap/hostileEncounters.mjs";
import {generateEncounterLevel} from "worldmap/encounterLevels.mjs";
import loadCaravansIntoLevel from "worldmap/caravanEncounterPlacement.mjs";

function shouldHaveEncounter() {
  if (!isJinxed(game.player))
    return getValueFromRange(0, 10) > game.player.statistics.luck;
  return true;
}

function computeDistance(pointA, pointB) {
  return Math.sqrt(
    Math.pow(pointB.x - pointA.x, 2) +
    Math.pow(pointB.y - pointA.y, 2)
  );
}

function positionForPathPoint(point) {
  return typeof point == "string"
    ? game.worldmap.getCity(point).position
    : point;
}

function distanceFromPath(path) {
  let totalDistance = 0;

  for (let i = 0; i < path.length - 1; i++) {
    const pointA = positionForPathPoint(path[i]);
    const pointB = positionForPathPoint(path[i + 1]);
    totalDistance += computeDistance(pointA, pointB);
  }
  return totalDistance;
}

function durationFromPath(path) {
  const speed = 500 / 1440; // 500 units = 24h
  const totalDistance = distanceFromPath(path);
  return totalDistance / speed;
}

function distanceAtPoint(path, positionIt) {
  let cumulativeDistance = 0;

  for (let i = 0; i < path.length - 1 && i < positionIt; i++) {
    const pointA = positionForPathPoint(path[i]);
    const pointB = positionForPathPoint(path[i + 1]);
    const segmentDistance = computeDistance(pointA, pointB);

    cumulativeDistance += segmentDistance;
  }
  return Math.round(cumulativeDistance);
}

function findCurrentPathSegment(path, distanceTraveled) {
  for (let i = 0; i < distanceAtPoint.length - 1; i++) {
    if (distanceTraveled >= distanceAtPoint(path, i) &&
        distanceTraveled <= distanceAtPoint(path, i + 1)) {
      return i;
    }
  }
  return 0;
}

function reversePath(path) {
  const reversed = [];
  for (let i = path.length - 1 ; i >= 0 ; --i)
    reversed.push(path[i]);
  return reversed;
}

function steelRangerBunkerPath() {
  return [
    "cristal-den",
    { x: 1500, y: 640 },
    "steel-ranger-bunker"
  ];
}

function thornhoofPath() {
  const base = steelRangerBunkerPath();
  base.push("thornhoof");
  return base;
}

// 48h -> 1000

export default class CaravanProcess {
  get hasCaravan() {
    return this.goingTo !== null;
  }

  get pendingReward() {
    return game.getVariable("caravanReward", 0);
  }

  set pendingReward(value) {
    if (value)
      game.setVariable("caravanReward", value);
    else
      game.unsetVariable("caravanReward");
  }

  get duration() {
    return game.getVariable("caravanDuration", 0);
  }

  set duration(value) {
    if (value)
      game.setVariable("caravanDuration", value);
    else
      game.unsetVariable("caravanDuration");
  }

  get currentDuration() {
    return game.getVariable("caravanDurationAt", 0);
  }

  set currentDuration(value) {
    if (value)
      game.setVariable("caravanDurationAt", value);
    else
      game.unsetVariable("caravanDurationAt");
  }

  get startedAt() {
    return game.getVariable("caravanStartedAt", null);
  }

  set startedAt(value) {
    if (value !== null)
      game.setVariable("caravanStartedAt", value);
    else
      game.unsetVariable("caravanStartedAt");
  }

  get goingTo() {
    return game.getVariable("caravanTarget", null);
  }

  set goingTo(value) {
    if (value !== null)
      game.setVariable("caravanTarget", value);
    else
      game.unsetVariable("caravanTarget");
  }

  get path() {
    if (game.hasVariable("caravanPath"))
      return JSON.parse(game.getVariable("caravanPath"));
    return null;
  }

  set path(value) {
    if (value)
      game.setVariable("caravanPath", JSON.stringify(value));
    else
      game.unsetVariable("caravanPath");
  }

  get hostileEncounterOver() {
    if (this.currentDuration > 0 && typeof level != "undefined")
      return !level.combat;
    return true;
  }

  startCaravan(fromCity, targetCity) {
    let path = [fromCity, targetCity];

    // Thornhoof Caravan Quest handler for the first of the two caravan steps
    if (fromCity == "steel-ranger-bunker" && targetCity == "thornhoof")
      return this.startCaravanWithPath(path);

    if (fromCity == "steel-ranger-bunker")
      path = reversePath(steelRangerBunkerPath());
    else if (targetCity == "steel-ranger-bunker")
      path = steelRangerBunkerPath();
    if (fromCity == "thornhoof")
      path = reversePath(thornhoofPath());
    else if (targetCity == "thornhoof")
      path = thornhoofPath();
    this.startCaravanWithPath(path);
  }

  startCaravanWithPath(path) {
    this.startedAt = path[0];
    this.goingTo   = path[path.length - 1];
    this.path      = path;
    this.duration  = durationFromPath(this.path);
    this.currentDuration = 0;
    console.log("Duration will be", this.duration);
    game.exitLevel(function() {});
  }

  onCaravanStarted() {
    this.triggerNextStep();
  }

  onExitingLevel() {
    if (this.withCaravanLeader)
      game.uniqueCharacterStorage.detachCharacter(this.defaultCaravanLeader);
    if (this.hostileEncounterOver)
      this.triggerNextStep();
    else
      this.onCaravanFailure();
  }

  triggerNextStep() {
    const durationLeft = this.duration - this.currentDuration;
    const randomDuration = function() { return Math.random() * (60 * 20); };
    const spareDuration = 60 * 7;
    let stepDuration = spareDuration;
    let withEncounter = false;

    console.log("Caravan.triggerNextStep", this.duration, this.currentDuration, game.getVariable("caravanDurationAt", 0), durationLeft);
    while (stepDuration < durationLeft) {
      stepDuration += randomDuration();
      if (shouldHaveEncounter())
        break ;
    }
    this.currentDuration += Math.min(stepDuration, durationLeft);
    game.asyncAdvanceTime(stepDuration, () => {
      this.updateWorldmapPosition();
      if (this.currentDuration < durationLeft)
        this.onHostileEncounter();
      else
        this.onDestinationReached();
    });
  }

  updateWorldmapPosition() {
    const path = this.path;
    const traveledRatio = this.currentDuration / this.duration;
    const totalDistance = distanceAtPoint(path, path.length - 1);
    const distanceTraveled = totalDistance * traveledRatio;
    const pathIndex = findCurrentPathSegment(path, distanceTraveled);

    const startPoint = positionForPathPoint(path[pathIndex]);
    const endPoint   = positionForPathPoint(path[pathIndex + 1]);

    const segmentDistance = distanceAtPoint(path, pathIndex + 1) - distanceAtPoint(path, pathIndex);
    const segmentProgress = (distanceTraveled - distanceAtPoint(path, pathIndex)) / segmentDistance; // will crash if segmentDistance is 0, but that would be absurd in the first place

    game.worldmap.currentPosition.x = startPoint.x + (endPoint.x - startPoint.x) * segmentProgress;
    game.worldmap.currentPosition.y = startPoint.y + (endPoint.y - startPoint.y) * segmentProgress;
    game.worldmap.targetPosition = game.worldmap.currentPosition;
  }

  onDestinationReached() {
    if (game.worldmap.discoveredCities.indexOf(this.goingTo) < 0)
      game.worldmap.discoveredCities.push(this.goingTo);
    game.script.loadCaravanIntoCity = this.goingTo != "cristal-den";
    game.switchToCity(this.goingTo);
    game.playerParty.addExperience(this.xpReward);
    game.appendToConsole(i18n.t("messages.caravan-completed", {
      xp: this.xpReward,
      goingTo: i18n.t(`locations.${this.goingTo}`)
    }));
    this.goingTo = null;
    if (game.quests.getQuest("thornhoof/caravan")?.script?.caravanInProgress)
      return ;
    this.pendingReward += 200; // TODO should vary depending on destination
  }

  onHostileEncounter() {
    const parties = generateHostileEncounter();

    parties.unshift(this.caravanPartyData());
    game.randomEncounters.startEncounter(generateEncounterLevel(), {
      "title": "caravan-attack",
      "parties": parties,
      "callback": () => { loadCaravansIntoLevel(this.caravanCount); }
    });
  }

  onCaravanFailure() {
    // Thornhoof Caravan Quest handler
    if (game.quests.hasQuest("thornhoof/caravan"))
      game.quests.getQuest("thornhoof/caravan").script.onCaravanFailure();

    this.goingTo = null;
    this.currentDuration = 0;
    game.setVariable("abandonnedCaravan", 1);
  }

  get xpReward() {
    return 350;
  }

  get caravanCount() {
    return 2;
  }

  get withCaravanLeader() {
    return game.getVariable("withCaravanLeader", 1) == 1;
  }

  get escortMembersCount() {
    return 4;
  }

  get defaultCaravanLeader() {
    return game.getCharacter("cristal-den/caravan-leader");
  }

  makeCaravanLeaderCharacter() {
    let character;

    if (!this.withCaravanLeader) {
      character = level.factory().generateCharacter("caravan-leader", "cristal-den/caravan-leader-alt");
      character.setScript("cristal-den/caravan-leader-alt");
    }
    return character || this.defaultCaravanLeader;
  }

  caravanPartyData() {
    const object = {
      "name": "caravan-escort",
      "members": [],
      "zone": "encounter-zone-2"
    };

    if (this.withCaravanLeader)
      object.members.push(this.defaultCaravanLeader);
    else
      object.members.push({}); // TODO: make an alternate caravan leader which can die without consequences in the game story
    for (let i = 0 ; i < this.escortMembersCount ; ++i) {
      const characterSheet = i % 2 == 0 ? "cristal-den/caravaneer-A" : "cristal-den/caravaneer-B";
      object.members.push({
        "sheet": characterSheet,
        "inventory": i % 3 == 0 ? inventoryFighter : inventoryShooter
      });
    }
    return object;
  }
}

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

/*
          "inventory": {
            "items": [],
            "slots": {
              "armor": {
                "hasItem": false,
                "slotType": "armor"
              },
              "use-1": {
                "hasItem": false,
                "slotType": "any"
              },
              "use-2": {
                "hasItem": false,
                "slotType": "any"
              }
            }
          }


                                  "itemType": "combat-knife",
                        "objectName": "combat-knife",
                        "spriteName": "items",
                        "useMode": "use",

          */
