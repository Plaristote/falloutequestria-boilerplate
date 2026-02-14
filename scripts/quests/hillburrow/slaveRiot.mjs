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
    this.model.setVariable("slaveCount", level.findGroup("slaves").objects.length);
    this.model.setVariable("guardCount", level.findGroup("guards").find(candidate => candidate.type == "Character" && candidate.isAlive()).length);
  }

  get xpReward() {
    return 3000 + (100 * this.aliveSlaves) + (250 * (this.isRainyAlive ? 1 : 0));
  }

  get broughtWeapons() {
    return this.model.getVariable("broughtWeapons", 0);
  }

  set broughtWeapons(value) {
    this.model.setVariable("broughtWeapons", value);
  }

  get slaveCount() {
    return this.model.getVariable("slaveCount");
  }

  get guardCount() {
    return this.model.getVariable("guardCount");
  }

  get aliveSlaves() {
    return level.findGroup("slaves").find(candidate => candidate.type == "Character" && candidate.isAlive()).length;
  }

  get killedGuards() {
    return this.model.getVariable("killedGuards", 0);
  }

  set killedGuards(value) {
    this.model.setVariable("killedGuards", value);
  }

  get isRainyAlive() {
    return !this.model.hasVariable("rainyDead");
  }

  getDescription() {
    let text = "";

    if (this.model.hasVariable("rendezvous"))
      text += `<p>${this.tr("desc-rendezvous")}</p>`;
    if (this.model.hasVariable("riotPlanned"))
      text += `<p>${this.tr("desc-riotPlanned")}</p>`;
    if (this.model.hasVariable("riotStarted")) {
      text += `<p>${this.tr("desc-riotStarted")}</p>`;
      if (this.model.isObjectiveCompleted("killPotioks"))
        text += `<p>${this.tr(this.aliveSlaves > 0 ? "desc-riotSuccess" : "desc-riotFailure")}</p>`;
      else if (this.aliveSlaves == 0)
        text += `<p>${this.tr("desc-riotUtterFailure")}</p>`;
    } else if (this.model.isObjectiveCompleted("killPotioks")) {
      text += `<p>${this.tr("desc-soloedPotioks")}</p>`;
    } else if (this.aliveSlaves == 0) {
      text += `<p>${this.tr("desc-slavesDead")}</p>`;
    }
    if (!this.isRainyAlive)
      text += `<p>${this.tr("desc-rainyDead")}</p>`;
    return text;
  }

  getObjectives() {
    let objectives = [];

    if (this.model.hasVariable("rendezvous"))
      objectives.push({ label: this.tr("rendezvous"), success: this.model.isObjectiveCompleted("metAtPen") });
    if (this.model.hasVariable("riotPlanned")) {
      objectives.push({ label: this.tr("fetchWeapons", { found: this.broughtWeapons, required: this.slaveCount }), success: this.model.isObjectiveCompleted("fetchWeapons") });
      objectives.push({ label: this.tr("killPotioks", { killed: this.killedGuards, total: this.guardCount }), success: this.model.isObjectiveCompleted("killPotioks") });
      objectives.push({ label: this.tr("saveSlaves", { alive: this.aliveSlaves, total: this.slaveCount }), success: this.aliveSlaves > 0 && this.model.isObjectiveCompleted("killPotioks"), failure: this.aliveSlaves == 0 });
      objectives.push({ label: this.tr("saveRainy"), success: this.isRainyAlive > 0 && this.model.isObjectiveCompleted("killPotioks"), failure: !this.isRainyAlive });
    }
    return objectives;
  }

  addPenRendezvous() {
    this.model.setVariable("rendezvous", 1);
  }

  addRiotPlans() {
    this.model.setVariable("riotPlanned", 1);
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
    this.model.setVariable("riotStarted", 1);
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
      const slaveGroup = level.findGroup("slaves");
      const filter = candidate => { return candidate.isAlive && candidate.isAlive(); }

      if (guardGroup.find(candidate => character == candidate).length > 0)
        this.killedGuards++;
      else if (character == slaveGroup.findObject("rainy-purple"))
        this.model.setVariable("rainyDead", 1);
      if (guardGroup.find(filter).length == 0) {
        this.model.completeObjective("killPotioks");
        this.model.completed = true;
      }
      if (slaveGroup.find(filter).length == 0) {
        this.model.failure = true;
      }
    }
  }

  onSuccess() {
    super.onSuccess();
    game.dataEngine.addReputation("hillburrow", 75);
    level.find("slaves.*").forEach(slave => slave.script.seekAndDestroy.disable());
  }
}
