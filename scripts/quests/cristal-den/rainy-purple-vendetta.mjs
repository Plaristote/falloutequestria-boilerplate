import {QuestHelper, QuestFlags} from "../helpers.mjs";
import {updateDenSlaversDead} from "../../characters/cristal-den/slavers/denSlaversDead.mjs";

const questName = "cristal-den/rainy-purple-vendetta";

export function shouldRainyPurpleGoOnHerOwn() {
  const quest = game.quests.getQuest(questName);

  return !quest || !quest.isObjectiveCompleted("join");
}

export function rainyPurpleGoesOnHerOwn() {
  const rainyPurple = game.getCharacter("hillburrow/rainy-purple");
  const quest = game.quests.addQuest(questName, QuestFlags.HiddenQuest);

  quest.script.onRainyPurpleKilled();
  quest.completed = quest.failed = true;
  game.uniqueCharacterStorage.detachCharacter(rainyPurple);
}

export function getSlavers() {
  if (typeof level !== "undefined") {
    const guards = level.find("slavers-den.guards.guard#*");

    return guards.concat(level.findObject("slavers-den.slave-master"));
  }
  return null;
}

export function findLiveSlaver() {
  const slavers = level.find("slavers-den.guards.*");
  const boss = level.findObject("slavers-den.slave-master");

  slavers.push(boss);
  for (let i = 0 ; i < slavers.length ; ++i) {
    if (slavers[i].isAlive())
      return slavers[i];
  }
  return null;
}

export class RainyPurpleVendetta extends QuestHelper {
  initialize() {
    this.model.location = "cristal-den";
    this.model.addObjective("join",        this.tr("join"));
    this.model.addObjective("killSlavers", this.tr("killSlavers"));
    this.model.addObjective("freeSlaves",  this.tr("freeSlaves"));
    this.xpReward = 2500;
  }

  get rainyPurple() {
    return game.getCharacter("hillburrow/rainy-purple");
  }

  get rainyPurpleAlive() {
    return !this.model.hasVariable("rainyPurpleKilled");
  }

  set rainyPurpleAlive(value) {
    this.model.setVariable("rainyPurpleKilled", value ? 1 : 0);
  }

  completeObjective(objectiveName, completed) {
    if (this.model.areObjectivesCompleted(["freeSlaves", "killSlavers"]))
      this.model.completed = true;
  }

  goToQuest() {
    this.model.completeObjective("join");
    game.asyncAdvanceTime(60, () => {
      const city = worldmap.getCity("cristal-den");
      worldmap.setPosition(city.position.x, city.position.y);
      game.setVariable("rainy-purple-vendetta-state", 1);
      game.switchToLevel("cristal-den-center", "rainy-purple-vendetta-entrance");
    });
  }

  start() {
    const zone = level.getTileZone("rainy-purple-vendetta-entrance");
    const rainyPurple = this.rainyPurple;

    game.uniqueCharacterStorage.loadCharacterToZone("hillburrow/rainy-purple", zone);
    rainyPurple.setScript("cristal-den/rainy-purple.mjs");
    rainyPurple.script.scene.initialize();
    rainyPurple.tasks.removeTask("runRoutine");
    rainyPurple.tasks.addUniqueTask("seekAndDestroy", 2123, 0);
  }

  onCharacterKilled(character) {
    if (level.name == "cristal-den-center") {
      const slavers = getSlavers();

      console.log("character killed", character.characterSheet);

      if (slavers.indexOf(character) >= 0) {
        const filter = candidate => { return candidate.isAlive(); };
        const liveSlavers = slavers.find(filter);

        if (!liveSlavers || liveSlavers.length === 0) {
          this.model.completeObjective("killSlavers");
          this.rainyPurple.script.scene.triggerNextStep();
        }
      } else if (character.characterSheet == "hillburrow/rainy-purple") {
      }
    }
  }

  onRainyPurpleKilled() {
    console.log("killed rainy purple");
    this.model.addObjective("rainyPurpleMustSurvive", this.tr("rainyPurpleMustSurvive"));
    this.model.failObjective("rainyPurpleMustSurvive");
    this.rainyPurpleAlive = false;
  }

  onSlavePenDoorOpened() {
    const slaves = level.find("slavers-den.slave-pen.slave#*");

    slaves.forEach(slave => { slave.script.triggerEscape(); });
    this.model.completeObjective("freeSlaves");
  }

  onLevelChanged() {
    if (level.name == "cristal-den-center") {
      const slavePenDoor = level.findObject("slavers-den.slave-pen.door");
      const self = this;

      slavePenDoor.script.onToggle = function(opened) {
        if (opened)
          self.onSlavePenDoorOpened();
      };
    } else if (this.model.inProgress && this.rainyPurpleAlive) {
      this.rainyPurple.takeDamage(this.rainyPurple.statistics.hitPoints, null);
      this.rainyPurpleAlive = false;
    }
  }

  onQuestAborted() {
    this.model.failed = true;
    if (this.rainyPurpleAlive) {
      const rainyPurple = game.getCharacter("hillburrow/rainy-purple");

      rainyPurple.takeDamage(rainyPurple.statistics.hitPoints + 1, null);
    }
  }

  onSuccess() {
    super.onSuccess();
    if (this.rainyPurpleAlive)
      this.rainyPurple.script.onVendettaOver();
    game.dataEngine.addReputation("cristal-den", -10);
  }
}
