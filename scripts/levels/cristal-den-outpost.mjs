import {LevelBase} from "./base.mjs";

function quest() {
  return game.quests.getQuest("cristal-den/copper-outpost");
}

export default class extends LevelBase {
  onLoaded() {
    game.player.script.onCharacterDetected = (character) => {
      if (level.name === "cristal-den-outpost" && character.objectName.startsWith("wolf")) {
        quest().setVariable("found-wolves", 1);
      }
    };
  }

  onExit() {
    delete game.player.script.onCharacterDetected;
  }

  onZoneEntered(name, object) {
    if (object == game.player && (name == "outpost-A" || name == "outpost-B"))
      quest().completeObjective("investigate");
  }
}
