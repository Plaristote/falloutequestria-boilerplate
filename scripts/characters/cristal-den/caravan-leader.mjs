import CharacterBehaviour from "./caravan-leader-alt.mjs";

export class CaravanLeader extends CharacterBehaviour {
  constructor(model) {
    super(model);
  }

  startGhoulHunterExpedition() {
    game.script.ghoulHunterExpedition.startExpedition(
      game.worldmap.getCurrentCity().name
    );
  }
}
