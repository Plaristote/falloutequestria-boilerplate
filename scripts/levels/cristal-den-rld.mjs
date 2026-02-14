import {LevelBase} from "./base.mjs";

export default class extends LevelBase {
  get pimpChangelingQuest() {
    return game.quests.getQuest("cristal-den/pimp-changeling");
  }

  onExit() {
    super.onExit();
    if (this.pimpChangelingQuest?.completed && !this.pimpChangelingQuest.script.petioleCleanedUp)
      this.cleanUpPimpBodies();
  }

  cleanUpPimpBodies() {
    const group = level.findGroup("brothel");
    const desk = group.findObject("pimps.desk");

    ["pimp", "staff#1", "staff#2"].forEach(path => {
      const character = group.findObject(path);
      if (character) {
        character.inventory.transferTo(desk.inventory);
        group.deleteObject(character);
      }
    });
    this.pimpChangelingQuest.script.petioleCleanedUp = true;
  }
}
