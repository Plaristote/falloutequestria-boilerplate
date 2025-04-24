import {isJinxed, getValueFromRange} from "./behaviour/random.mjs";
import {generateHostileEncounter} from "worldmap/hostileEncounters.mjs";
import {generateEncounterLevel} from "worldmap/encounterLevels.mjs";
import loadCaravansIntoLevel from "worldmap/caravanEncounterPlacement.mjs";

function shouldHaveEncounter() {
  if (!isJinxed(game.player))
    return getValueFromRange(0, 10) > game.player.statistics.luck;
  return true;
}

export default class CaravanProcess {
  get hasCaravan() {
    return this.goingTo !== null;
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

  get hostileEncounterOver() {
    if (this.currentDuration > 0 && typeof level != "undefined")
      return !level.combat;
    return true;
  }

  startCaravan(fromCity, targetCity, duration = 4320) {
    this.startedAt       = fromCity;
    this.goingTo         = targetCity;
    this.duration        = duration;
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
    const spareDuration = 60 * 14;
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
    const traveledRatio = this.currentDuration / this.duration;
    const fromCity = game.worldmap.getCity(this.startedAt);
    const toCity = game.worldmap.getCity(this.goingTo);
    const deltaX = fromCity.position.x - toCity.position.x;
    const deltaY = fromCity.position.y - toCity.position.y;

    // That's no good, we probably need to create a set of points the caravan travels to and from,
    // so we can know for sure the player won't end up in the middle of impassable terrain.
    game.worldmap.currentPosition.x -= deltaX * traveledRatio;
    game.worldmap.currentPosition.y -= deltaY * traveledRatio;
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
    // TODO implement some consequences for a player abandonning a caravan
    this.goingTo = null;
    this.currentDuration = 0;
  }

  get xpReward() {
    return 350;
  }

  get caravanCount() {
    return 2;
  }

  get withCaravanLeader() {
    return true;
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
        "inventory": {}
      });
    }
    return object;
  }
}
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
