import {LevelBase} from "./base.mjs";

class Level extends LevelBase {
  initialize() {
    this.displayTutorialPage(0);
  }

  displayTutorialPage(page) {
    if (!level.hasVariable(`tutorial-${page}-shown`) && level.tutorial?.enabled) {
      level.tutorial.page = page;
      level.tutorial.visible = true;
      level.setVariable(`tutorial-${page}-shown`, 1);
    }
  }

  onCombatStarted() {
    this.displayTutorialPage(3);
  }

  onExit() {
    const accessComputer = level.findObject("access-computer");
    accessComputer.setVariable("enabled", true);
    super.onExit();
  }

  onZoneEntered(zoneName, object) {
    if (zoneName === "about-to-exit" && object === game.player && !level.hasVariable("exited-once")) {
      level.setVariable("exited-once", 1);
      game.player.actionQueue.reset();
      game.appendToConsole(i18n.t("stable-entrance.about-to-exit"));
      game.player.statistics.addExperience(250);
      game.appendToConsole(i18n.t("messages.xp-gain", { xp: 250 }));
    }
  }
}

export function create(model) {
  return new Level(model);
}
