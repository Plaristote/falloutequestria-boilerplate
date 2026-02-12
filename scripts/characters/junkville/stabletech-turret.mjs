import CharacterBehaviour from "./../turret.mjs";

const statusVarName = "junkvilleDumpsTurretDown";

export function status() {
  return !game.hasVariable(statusVarName) ? "on" : "off";
}

export default class extends CharacterBehaviour {
  onDied() {
    game.setVariable(statusVarName, 1);
    super.onDied();
  }
}
