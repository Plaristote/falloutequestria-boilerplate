import {CharacterBehaviour} from "../character.mjs";
import SeekAndDestroyComponent from "../components/seekAndDestroy.mjs";

export default class extends CharacterBehaviour {
  constructor(model) {
    super(model);
    this.seekAndDestroy = new SeekAndDestroyComponent(this, this.getBanditTarget.bind(this));
    this.seekAndDestroy.runAwayBehaviour = this.runAwayToCaveExit.bind(this);
  }

  onLoaded() {
    this.seekAndDestroy.onLoaded();
  }

  initialize() {
    this.seekAndDestroy.enable();
  }

  get textBubbles() {
    return [
      { content: i18n.t("junkville-dogs-mediation.combattant-line-1"), duration: 4343 },
      { content: i18n.t("junkville-dogs-mediation.combattant-line-2"), duration: 4343 },
      { content: i18n.t("junkville-dogs-mediation.combattant-line-3"), duration: 4343 }
    ];
  }

  runAwayToCaveExit() {
    if (this.model.actionPoints > 0) {
      this.model.actionQueue.reset();
      this.model.actionQueue.pushMovementTo(75, 99);
      this.model.actionQueue.pushScript(() => {
        console.log("UndergroundCombattant:", this.model.statistics.name, "escaped");
        level.deleteObject(this.model);
      });
      this.model.actionQueue.start();
    }
    if (!this.model.actionQueue.isEmpty())
      return true;
  }

  getBanditTarget() {
    const bandits = level.findGroup("bandits").objects
      .filter(bandit => bandit.isAlive())
      .sort((a, b) => a.getDistance(this.model) - b.getDistance(this.model));

    return bandits[0];
  }
}

