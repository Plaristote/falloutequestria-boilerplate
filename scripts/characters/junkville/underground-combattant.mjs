import {CharacterBehaviour} from "../character.mjs";

export class UndergroundCombattant extends CharacterBehaviour {
  constructor(model) {
    super(model);
  }

  initialize() {
    this.model.tasks.addTask("onIdle", 2525 * (1 + Math.random()), 0);
  }

  get textBubbles() {
    return [
      { content: i18n.t("junkville-dogs-mediation.combattant-line-1"), duration: 4343 },
      { content: i18n.t("junkville-dogs-mediation.combattant-line-2"), duration: 4343 },
      { content: i18n.t("junkville-dogs-mediation.combattant-line-3"), duration: 4343 }
    ];
  }

  onTurnStart() {
    if (this.model.morale <= 0)
      return this.runAwayToCaveExit();
    if (this.findCombatTarget())
      return super.onTurnStart();
    return this.headTowardsDog();
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

  headTowardsDog() {
    const target = this.getDogTarget();

    if (this.model.actionPoints > 0 && target) {
      this.model.actionQueue.reset();
      this.model.actionQueue.pushReach(target);
      this.model.actionQueue.start();
    }
    if (!this.model.actionQueue.isEmpty()) {
      return true;
    }
    else if (level.combat) {
      level.passTurn(this.model)
    }
    return false;
  }

  onIdle() {
    console.log("UndergroundCombattant onIdle");
    if (!level.combat && this.model.actionQueue.isEmpty())
      this.headTowardsDog();
  }
}
