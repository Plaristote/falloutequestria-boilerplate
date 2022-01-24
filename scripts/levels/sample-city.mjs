import {LevelBase} from "./base.mjs";

class Level extends LevelBase {
  onZoneEntered(zoneName, object) {
    if (zoneName.startsWith("exit-") && object.path === "passerby.passerby#5") {
      const quest = game.quests.getQuest("catch-robber");

      if (quest)
        quest.setVariable("escaped", true);
    }
  }
}

export function create() {
  return new Level;
}
