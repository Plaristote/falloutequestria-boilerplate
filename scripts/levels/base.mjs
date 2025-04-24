import loadCaravansIntoLevel from "../worldmap/caravanEncounterPlacement.mjs";

export class LevelBase {
  constructor() {
    this.scenes = [];
    this.model = level;
  }

  onLoaded() {
    if (game.script.loadCaravanIntoCity)
      this.loadCaravanIntoCity();
  }

  loadCaravanIntoCity() {
    const character  = game.script.caravan.makeCaravanLeaderCharacter();
    const zone = level.getZoneFromName("caravan-entry");

    if (!zone) {
      console.log("LevelBase.loadCaravanIntoCity: caravan-entry zone is missing.");
      return ;
    }
    if (game.script.caravan.withCaravanLeader) {
      game.uniqueCharacterStorage.loadCharacterToZone("cristal-den/caravan-leader", zone);
    } else {
      character.position.x = character.position.y = -1; // lil trick for setCharacterPosition
      level.moveCharacterToZone(character, zone);
    }
    loadCaravansIntoLevel(1, character);
    level.tasks.addTask("popOutCaravanFromCity", 120 * 60 * 1000, 1);
    game.script.loadCaravanIntoCity = null;
  }

  popOutCaravanFromCity() {
    const character = level.findObject("caravan-leader");
    const caravan   = level.findObject("caravan#1");

    if (character === game.script.caravan.defaultCaravanLeader)
      game.uniqueCharacterStorage.detachCharacter(character);
    else
      level.deleteObject(character);
    level.deleteObject(caravan);
  }

  appendSceneManager(sceneManager) {
    this.scenes.push(sceneManager);
    level.tasks.addUniqueTask("sceneTick", 1789, 0);
  }

  removeSceneManager(sceneManager) {
    this.scenes.splice(this.scenes.indexOf(sceneManager));
    if (this.scenes.length === 0)
      level.tasks.removeTask("sceneTick");
  }

  sceneTick() {
    this.scenes.forEach(sceneManager => {
      sceneManager.onSceneTick();
    });
  }

  onExit() {
    this.scenes.forEach(sceneManager => {
      sceneManager.onLevelExit();
    });
  }
}

export function create() {
  return new LevelBase;
}
