const tutorialByZone = {
  tutorialLockpick:    2,
  tutorialFindStuff:   7,
  tutorialDynamite:    8,
  tutorialFieldOfView: 9,
  tutorialTraps:       10,
  tutorialExitZone:    11
};

export class Level {
  constructor(model) {
    model.tasks.addTask("onGameStarted", 1000, 1);
    this.ambiance = "cavern";
  }

  onGameStarted() {
    this.displayTutorialPage(0);
  }

  onZoneEntered(zoneName, object) {
    if (tutorialByZone[zoneName] != undefined && object === level.player)
      this.displayTutorialPage(tutorialByZone[zoneName]);
    if (object === level.player) {
      switch (zoneName) {
      case "objective-leave-first-room":
        game.quests.getQuest("tutorial").completeObjective("leave-first-room");
        break ;
      case "exit-zone":
        game.quests.getQuest("tutorial").completeObjective("exit-cavern");
        break ;
      }
    }
  }

  displayTutorialPage(page) {
    if (!level.hasVariable(`tutorial-${page}-shown`) && level.tutorial.enabled) {
      level.tutorial.page = page;
      level.tutorial.visible = true;
      level.setVariable(`tutorial-${page}-shown`, 1);
    }
  }

  onCombattantsChanged() {
    console.log("onCombattantsChanged");
    if (level.combattants.length > 1) {
      console.log("trigger tutorial combat");
      level.setVariable("tutorialCombatStart", 1);
      this.displayTutorialPage(4);
    }
  }
  
  onCombatEnded() {
    console.log("onCombatEnded", level.hasVariable("tutorialCombatStart"), !level.hasVariable("tutorialCombatEnd"));
    if (level.hasVariable("tutorialCombatStart") && !level.hasVariable("tutorialCombatEnd")) {
      console.log("display tutorial end combat");
      game.quests.getQuest("tutorial").completeObjective("win-first-fight");
      level.player.statistics.addExperience(level.player.statistics.xpNextLevel);
      this.displayTutorialPage(6);
      level.setVariable("tutorialCombatEnd", 1);
    }
  }
}

export function create(model) {
  return new Level(model);
}
