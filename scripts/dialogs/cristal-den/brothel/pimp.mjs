import {AlarmLevel} from "../../../characters/components/alarm.mjs";

class Dialog {
  constructor(dialog) {
    this.dialog = dialog;
  }

  entry() {
    if (!this.dialog.npc.hasVariable("met")) {
      this.dialog.npc.setVariable("met", 1);
      return { textKey: "entry" };
    }
    switch (this.dialog.previousAnswer) {
      case "ask-about-him":
        return { textKey: "about-self" };
      case "ask-about-activity":
        return { textKey: "about-activity" };
    }
    return { textKey: "entry-alt" };
  }

  startFight() {
    this.dialog.npc.script.callGuardsOn(game.player);
    if (this.canAttackWithPetiole) {
      this.dialog.npc.setAsEnemy(level.findObject("brothel.petiole"));
    }
  }

  giveDenounciationReward() {
    game.player.inventory.addItemOfType("bottlecaps", 350);
  }

  triggerDenounciationRoute() {
    this.dialog.npc.script.startLookForPetiole();
  }

  get changelingQuest() {
    return game.quests.getQuest("cristal-den/pimp-changeling");
  }

  get hasChangelingQuest() {
    const quest = this.changelingQuest;
    return quest != null && quest.hasObjective("killPimp") && !quest.failed;
  }

  get canAttackWithPetiole() {
    return this.hasChangelingQuest && this.changelingQuest.script.isWithPetiole === true;
  }

  get canBarterDenounciation() {
    return game.player.statistics.charisma > 6 || game.player.statistics.speech > 65 || game.player.statistics.barter >= 45;
  }

  get canBackpedalDenounciation() {
    return game.player.statistics.charisma > 6 || game.player.statistics.speech > 45;
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
