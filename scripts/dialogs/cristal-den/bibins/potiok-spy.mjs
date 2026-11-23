import {
  hasPotiokSpyQuest, learnedAboutPotiokSpyConfession, foundPotiokSpy, learnedAboutSavageConnection,
  onFoundPotiokSpy, onLearnedAboutPotiokSpyConfession, onLearnedAboutSavageConnection,
  onStartPotiokSpyEscape
} from "../../../quests/cristal-den/potioks-spy.mjs";

class Dialog {
  constructor(dialog) {
    this.dialog = dialog;
  }

  wasSentByPotioks() {
    return hasPotiokSpyQuest();
  }

  canReEnter() {
    return foundPotiokSpy();
  }

  canPassForBibinBand() {
    return game.player.statistics.speech > 70 && game.player.statistics.intelligence >= 5;
  }

  canProbePotiokLeaks() {
    return !learnedAboutPotiokSpyConfession();
  }

  canProbeAboutSavageConnection() {
    return !learnedAboutSavageConnection();
  }

  murderAvailableAfterConfession() {
    return !this.canProbeAboutSavageConnection();
  }

  canConvinceToTellAboutConfession() {
    return game.player.statistics.speech > 95 && !learnedAboutPotiokSpyConfession();
  }

  onProbing() {
    this.triggerFoundPotiokSpy();
  }

  triggerFoundPotiokSpy() {
    onFoundPotiokSpy();
  }

  onProbeEmployer() {
    onLearnedAboutPotiokSpyConfession();
  }

  onProbeVisitorFurther() {
    onLearnedAboutSavageConnection();
  }

  onConfession() {
    onLearnedAboutPotiokSpyConfession();
  }

  murderNpc() {
    this.dialog.npc.takeDamage(this.dialog.npc.statistics.hitPoints + 1, game.player);
  }

  onStartEscape() {
    onStartPotiokSpyEscape(this.dialog.npc);
  }

  onPotiokProbing() {
    if (!this.backToPotiokProbing) {
      this.backToPotiokProbing = true;
      return null;
    }
    return "...";
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
