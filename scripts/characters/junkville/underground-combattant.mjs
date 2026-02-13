import {CharacterBehaviour} from "../character.mjs";
import SeekAndDestroyComponent from "../components/seekAndDestroy.mjs";

export class UndergroundCombattant extends CharacterBehaviour {
  constructor(model) {
    super(model);
    this.seekAndDestroy = new SeekAndDestroyComponent(this, this.getDogTarget.bind(this));
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
      const ladder = level.findObject("ladder-dumps");
      this.model.actionQueue.reset();
      this.model.actionQueue.pushReach(ladder);
      this.model.actionQueue.pushScript(() => {
        console.log("UndergroundCombattant:", this.model.statistics.name, "escaped");
        level.deleteObject(this.model);
      });
      this.model.actionQueue.start();
    }
    if (!this.model.actionQueue.isEmpty())
      return true;
  }

  getDogTarget() {
    const dogs = level.findGroup("pack");
    const leaderA = level.findObject("dog-leader");
    const leaderB = level.findObject("dog-alt-leader");

    for (let i = 0 ; i < dogs.objects.length ; ++i) {
      const dog = dogs.objects[i];

      if (dog.isAlive())
        return dog;
    }
    if (leaderA && leaderA.isAlive())
      return leaderA;
    if (leaderB && leaderB.isAlive())
      return leaderB;
    return null;
  }
}
