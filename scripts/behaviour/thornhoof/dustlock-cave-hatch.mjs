export default class DustlockCaveHatch {
  constructor(model) {
    this.model = model;
  }

  getAvailableInteractions() {
    return ["use", "look"];
  }

  onUse() {
    for (let i = 0 ; i < game.playerParty.list.length ; ++i) {
      const character = game.playerParty.list[i];
      level.moveCharacterToZone(character, this.targetZone);
    }
  }

  get targetZone() {
    return level.getTileZone(this.model.floor === 0 ? "cellar-entry" : "cellar-exit");
  }
}
