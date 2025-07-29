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
    const position = this.dialog.npc.position;
    const guards = [level.findObject("brothel.staff#1"), level.findObject("brothel.staff#2")];

    guards.forEach(guard => {
      if (!guard.hasVariable("distracted")) {
        guard.script.alarmComponent.receiveAlarmSignal(position.x, position.y, game.player, AlarmLevel.ShootOnSight);
      }
    });
    this.dialog.npc.setAsEnemy(game.player);
    if (this.canAttackWithPetiole) {
      this.dialog.npc.setAsEnemy(level.findObject("brothel.petiole"));
    }
  }

  get changelingQuest() {
    return game.quests.getQuest("cristal-den/pimp-changeling");
  }

  get hasChangelingQuest() {
    const quest = this.changelingQuest;
    return quest != null && quest.hasObjective("killPimp");
  }

  get canAttackWithPetiole() {
    return this.hasChangelingQuest && this.changelingQuest.script.isWithPetiole === true;
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
