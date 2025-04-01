import {Generator as DefaultGenerator} from "../../generator.mjs";

export class Generator extends DefaultGenerator {
  get repairLevel() {
    return level.hasVariable("generatorManualRead") ? 2 : 3;
  }

  onRepaired(user) {
    if (this.model.objectName == "generator#1") {
      if (!this.model.hasVariable("repaired")) {
        this.model.setVariable("repaired", 1);
        level.player.statistics.addExperience(this.xpReward * 0.5);
        game.appendToConsole(i18n.t("capital.laboratory.generator#1-is-beyond-fixing"));
        game.appendToConsole(i18n.t("messages.xp-gain", {xp: this.xpReward}));
      }
      return ;
    } else {
      level.script.setPowerEnabled(true);
    }
    return super.onRepaired(user);
  }
}
