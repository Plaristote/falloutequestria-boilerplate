import {QuestHelper} from "../helpers.mjs";
import * as Vendetta from "../cristal-den/rainy-purple-vendetta.mjs";

const questName = "hillburrow/slaveRiot";

export const states = {
  NotStarted:  0,
  Preparation: 1,
  Rioting:     2,
  Completed:   3
};

export function areGuardsAlive() {
  const quest = game.quests.getQuest(questName);

  if (quest && quest.isObjectiveCompleted("killPotioks"))
    return false;
  return level.findGroup("guards").find(function(guard) {
    return guard.type == "Character" && guard.isAlive();
  }).length > 0;
}

export function getGuardTarget(character) {
  let targets = level.find("guards.**.*");
  const boss = level.findObject("boss");
  const mercenaryBoss = level.findObject("mercenary-boss");

  if (boss) targets.push(boss);
  if (mercenaryBoss) targets.push(mercenaryBoss);
  targets = targets.filter(target => target.isAlive());
  targets.sort((a, b) => character.getDistance(a) - character.getDistance(b));
  return targets[0];
}

export function getState() {
  const quest = game.quests.getQuest(questName);

  if (!areGuardsAlive() || (quest && quest.failed))
    return states.Completed;
  else if (quest && quest.hasVariable("riotStarted"))
    return states.Rioting;
  return quest ? states.Preparation : states.NotStarted;
}

function abort() {
  const quest = game.quests.getQuest(questName);

  level.script.removeSlaves();
  slaveRiot.completed = slaveRiot.failed = true;
}

function finalize() {
  const rainyPurple = game.getCharacter("hillburrow/rainy-purple");

  if (rainyPurple && Vendetta.shouldRainyPurpleGoOnHerOwn())
    Vendetta.rainyPurpleGoesOnHerOwn();
  level.script.removeSlaves();
  level.setVariable("slaveRiotFinalized", 1);
}

export function onExitBacktown() {
  switch (getState()) {
    case states.Rioting:
      abort();
      break ;
    case states.Completed:
      if (!level.hasVariable("slaveRiotFinalized"))
        finalize();
      break ;
  }
}

function equipItem(weaponInventory, slave) {
  let item = weaponInventory.findOne(item => { return item.category == "weapon"; });
  if (item) {
    if (item.quantity > 0) {
      const newItem = slave.inventory.addItemOfType(item.itemType);
      weaponInventory.destroyItem(item, 1);
      item = newItem;
    } else {
      weaponInventory.removeItem(item);
      slave.inventory.addItem(item);
    }
    slave.inventory.equipItem(item, "use-1");
  }
}

export class SlaveRiot extends QuestHelper {
  initialize() {
    this.model.location = "hillburrow";
    this.model.addObjective("fetchWeapons", this.tr("fetchWeapons"));
    this.model.addObjective("killPotioks", this.tr("killPotioks"));
    this.xpReward = 4000;
  }

  startRiot() {
    const weaponInventory = game.getCharacter("hillburrow/rainy-purple").inventory;
    const slaves = level.find("slaves.*");
    const guards = level.find("guards.**.*");

    slaves.forEach(slave => {
      slave.script.seekAndDestroy.enable();
      slave.tasks.removeTask("runRoutine");
      equipItem(weaponInventory, slave);
    });
    level.setVariable("riotStarted", 1);
    level.findObject("house.slave-pen.door-inside").locked = false;
    level.findObject("house.slave-pen.door-outside").locked = false;
    ["player", "hillburrow-slaves"].forEach(function(faction) {
      game.diplomacy.setAsEnemy(true, "hillburrow-potioks", faction);
    });
    guards.forEach(guard => {
      guard.script.onSlaveRiot();
    });
  }

  onCharacterKilled(character) {
    if (level.name == "hillburrow-backtown") {
      const guardGroup = level.findGroup("guards");
      const filter = candidate => { return candidate.isAlive && candidate.isAlive(); }

      if (guardGroup.find(filter).length == 0) {
        this.model.completeObjective("killPotioks");
        this.model.completed = true;
      }
    }
  }

  onSuccess() {
    super.onSuccess();
    game.dataEngine.addReputation("hillburrow", 75);
    level.find("slaves.*").forEach(slave => slave.script.seekAndDestroy.disable());
  }
}
