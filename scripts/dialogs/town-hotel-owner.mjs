import {DialogHelper} from "./helpers.mjs";
import {callGuards, AlarmLevel} from "../pnjs/components/alarm.mjs";
import {skillContest} from "../cmap/helpers/checks.mjs";

export class Dialog extends DialogHelper {
  constructor(dialog) {
    super(dialog);
    this.dialog.mood = "neutral";
  }

  getEntryPoint() {
    if (this.respectStrikes >= 3)
      return "disrespected-intro";
    if (game.quests.hasQuest("catch-robber"))
      return "pickpocket-intro";
    return "intro";
  }

  get respectStrikes() {
    return this.dialog.npc.hasVariable("respectStrikes")
      ? this.dialog.npc.getVariable("respectStrikes")
      : 0;
  }

  set respectStrikes(value) { this.dialog.npc.setVariable("respectStrikes", value); }
  
  onIntro() {
    this.dialog.mood = "angry";
  }

  onRespectIntro() {
    this.dialog.mood = "smile";
  }
  
  onTimeWasted() {
    this.respectStrikes++;
    this.dialog.mood = "angry";
  }

  disrespectfulIntro() {
    return this.dialog.t("disrespectful-intro", { name: game.player.statistics.name });
  }

  respectfulIntro() {
    this.dialog.mood = "smile";
    return this.dialog.t("respectfulIntro", { name: game.player.statistics.name });
  }

  jobPickpocketText() {
    return this.dialog.t("job-pickpocket", { name: game.player.statistics.name });
  }

  addPickpocketQuest() {
    game.quests.addQuest("catch-robber");
  }

  increaseDisrespect() {
    this.respectStrikes++;
  }

  startCombat() {
    this.dialog.mood = "angry";
    callGuards(level.findGroup("casino.guards"), game.player, AlarmLevel.ShootOnSight);
  }

  sendOutOfOffice() {
    const group = level.findGroup("casino.entry");

    level.moveCharacterToZone(game.player, group.controlZone);
  }

  kickOutOfOffice() {
    this.dialog.mood = "angry";
    this.respectStrikes = 3;
    this.sendOutOfOffice();
  }
  
  pickpocketWasKilled() {
    const quest = game.quests.getQuest("catch-robber");

    return quest && quest.isObjectiveCompleted("kill-robber");
  }
  
  pickpocketFound() {
    const quest = game.quests.getQuest("catch-robber");

    return !this.pickpocketWasKilled() && quest && quest.isObjectiveCompleted("find");
  }

  pickpocketTryToLie() {
    const winner = skillContest(this.dialog.player, this.dialog.npc, "speech", 10);

    if (winner != game.player)
      return "pickpocket-lie-failure";
    return "pickpocket-lie-success";
  }
  
  happilyGiveReward() {
    this.dialog.mood = "smile";
    this.giveReward();
  }
  
  giveReward() {
    game.player.inventory.addItemOfType("bottlecaps", 300);
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
