import CharacterBehaviour from "./outpost-body.mjs";

export default class extends CharacterBehaviour {
  constructor(model) {
    super(model);
  }

  onLook() {
    if (this.quest.script.inspectHerdBodyTest())
      game.appendToConsole(this.quest.tr("inspect-body-herd"));
    else
      game.appendToConsole(this.quest.tr("inspect-body-floor-1"));
    return true;
  }
}
