import {canWarnPotioksAboutBibin} from "../../../quests/hillburrow/sabotage.mjs";
import {RanchAccess} from "../../../levels/cristal-den-ranch.mjs";

class Dialog {
  constructor(dialog) {
    this.dialog = dialog;
  }

  getEntryPoint() {
    if (level.script.ranchAccess > RanchAccess.None)
      return "prompt-with-access";
    return "prompt";
  }

  wasSentByBitty() {
    return canWarnPotioksAboutBibin();
  }

  wasSentByEnforcers() {
    return game.hasVariable("cristalDenEnforcersRecommendToPotiok");
  }

  giveFullAccess() {
    level.script.grantAccess(RanchAccess.Bunker);
  }

  giveWorkAccess() {
    level.script.grantAccess(RanchAccess.Entrance);
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
