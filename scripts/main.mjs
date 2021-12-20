import {RandomEncounterComponent} from "./randomEncounters.mjs";

function contains(array, faction1, faction2) {
  return array.indexOf(faction1) >= 0 && array.indexOf(faction2) >= 0;
}

function mordinoHook(factions, hostility) {
  if (contains(factions, "mordino", "player") && hostility) {
    if (!game.quests.hasQuest("catch-mordino"))
      game.setFactionAsEnemy("city-sample", "player", true);
  }
  else if (contains(factions, "city-sample", "player") && hostility) {
    game.dataEngine.setFactionAsEnemy("mordino", "player");
    return true;
  }
  return false;
}

class Game extends RandomEncounterComponent {
  diplomacyUpdate(factions, hostility) {
    if (mordinoHook(factions, hostility))
      return ;
  }
}

export function create(model) {
  return new Game(model);
}
