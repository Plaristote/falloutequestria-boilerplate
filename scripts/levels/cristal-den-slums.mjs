import {LevelBase} from "./base.mjs";
import {potiokSpyQuestStarted, onEndPotiokSpyEscape, onExitPotiokSpyEscape} from "../quests/cristal-den/potioks-spy.mjs";
import {bibinFinalBattleOngoing, onExitBibinFinalBattle} from "../quests/cristal-den/bibins-final-battle.mjs";

export class CristalDenSlums extends LevelBase {
  onZoneEntered(zoneName, object) {
    console.log("CristalDenSlums onZoneEntered", zoneName, object.objectName, potiokSpyQuestStarted());
    if (zoneName == "escape-zone" && object.objectName == "potiok-spy" && potiokSpyQuestStarted())
      onEndPotiokSpyEscape(object);
  }

  onExit() {
    if (potiokSpyQuestStarted())
      onExitPotiokSpyEscape();
    if (bibinFinalBattleOngoing())
      onExitBibinFinalBattle();
  }
}
