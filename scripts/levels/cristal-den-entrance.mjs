import {LevelBase} from "./base.mjs";

function importCaravaners() {
  const caravanLeader = game.uniqueCharacterStorage.getCharacter("cristal-den/caravan-leader");

  if (caravanLeader && caravanLeader.isAlive())
    game.uniqueCharacterStorage.loadCharacterToCurrentLevel("cristal-den/caravan-leader", 17, 26);
}

export class CristalDenEntrance extends LevelBase {
  onLoaded() {
    importCaravaners();
  }
}

