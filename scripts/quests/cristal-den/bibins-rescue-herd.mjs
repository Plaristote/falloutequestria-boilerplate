import {QuestHelper, QuestFlags, requireQuest} from "../helpers.mjs";

const levelName = "cristal-den-herd-siege";

function createLocation() {
  const outpost = game.worldmap.createCity(levelName);

  outpost.level = levelName;
  outpost.position.x = 1170;
  outpost.position.y = 1705;
  outpost.size = 20;
  game.worldmap.revealCity(outpost);
  return outpost;
}

export default class BibinsRescueHerd extends QuestHelper {
  initialize() {
    this.model.addObjective("rescue");
    createLocation();
  }

  get location() {
    return this.model.isObjectiveCrossedOff("rescue") ? "cristal-den" : "wasteland";
  }

  get locationWasVisited() {
    return game.dataEngine.hasLevelBeenVisited(levelName);
  }

  onCharacterKilled(character) {
    if (typeof level != "undefined" && level.name == levelName && character.parent == level.findGroup("scouts"))
      this.onScoutKilled();
  }

  onScoutKilled() {
    const group = level.findGroup("scouts");

    if (group.find(object => object.isAlive()).length == 0)
      this.model.completeObjective("kill-scouts");
  }

  get foughtAlongHerd() {
    return this.model.hasVariable("foughtAlongHerd");
  }

  set foughtAlongHerd(value) {
    value ? this.model.setVariable("foughtAlongHerd", 1) : this.model.unsetVariable("foughtAlongHerd");
  }
}
