import {SceneManager} from "../../behaviour/sceneManager.mjs";
import {areDenSlaversDead} from "../../characters/cristal-den/slavers/denSlaversDead.mjs";
import * as Quest from "../../quests/cristal-den/rainy-purple-vendetta.mjs";

function getDoorGuards() {
  const group = level.findGroup("slavers-den.guards");
  const result = [];
  const guard1 = group.getObjectByName("guard#1");
  const guard2 = group.getObjectByName("guard#2");

  if (guard1) result.push(guard1);
  if (guard2) result.push(guard2);
  return result;
}

export class VendettaScene extends SceneManager {
  constructor(parent) {
    super(parent, "rainy-purple-vendetta");
  }

  get rainyPurple() {
    return game.getCharacter("hillburrow/rainy-purple");
  }

  get actors() {
    return Quest.getSlavers().concat(this.rainyPurple);
  }

  get states() {
    return [
      this.start.bind(this),
      this.fight.bind(this),
      this.freeSlaves.bind(this)
    ];
  }

  getVisibleGuard(guards) {
    this.rainyPurple.fieldOfView.detectCharacters();
    for (let i = 0 ; i < guards.length ; ++i) {
      if (this.rainyPurple.fieldOfView.isDetected(guards[i]))
        return guards[i];
    }
    return null;
  }

  start() {
    const guards = getDoorGuards();
    const visibleGuard = this.getVisibleGuard(guards);

    if (guards.length && visibleGuard !== null) {
      game.player.lookAt(visibleGuard);
      this.rainyPurple.lookAt(visibleGuard);
      this.startWithGuards(guards);
    }
    else
      this.startWithoutGuards();
  }

  startWithGuards(guards) {
    const actions = this.rainyPurple.actionQueue;

    guards.forEach(guard => { guard.lookAt(this.rainyPurple); });
    actions.pushSpeak(this.line("start"), 5000, "red");
    actions.pushWait(3);
    actions.pushScript(this.guardReaction.bind(this));
    actions.start();
  }

  guardReaction() {
    const guards = getDoorGuards();
    const actions = guards[0].actionQueue;

    actions.pushSpeak(this.line("guardReaction"), 5000, "yellow");
    actions.pushWait(3);
    actions.pushScript(this.battleCry.bind(this));
    actions.start();
  }

  battleCry() {
    const actions = this.rainyPurple.actionQueue;

    this.rainyPurple.movementMode = "running";
    actions.pushSpeak(this.line("battleCry"), 5000, "red");
    actions.pushWait(3);
    actions.pushScript(this.triggerNextStep.bind(this));
    actions.start();
  }

  startWithoutGuards() {
    const actions = this.rainyPurple.actionQueue;

    actions.pushSpeak(this.line("noGuards"), 5000, "white");
    actions.pushWait(3);
    actions.pushScript(this.triggerNextStep.bind(this));
    actions.start();
  }

  fight() {
    const guards = Quest.getSlavers();

    if (guards.length) {
      this.rainyPurple.tasks.addTask("seekAndDestroy", 4123, 0);
      this.rainyPurple.setAsEnemy(guards[0]);
      game.player.setAsEnemy(guards[0]);
    } else {
      this.triggerNextStep();
    }
  }

  freeSlaves() {
    const self = this;

    if (this.rainyPurple.isAlive()) {
      this.rainyPurple.tasks.removeTask("seekAndDestroy");
      this.rainyPurple.tasks.addUniqueTask("freeSlaves", 1987, 0);
    }
    else
      this.triggerNextStep();
  }

  triggerFight() {
    this.actors.forEach(character => { character.actionQueue.reset(); });
    this.triggerNextStep();
  }

  onDamageTaken(character, dealer) {
    if (this.state == 0)
      this.triggerFight();
  }

  onDied() {
    if (this.state == 0)
      this.triggerFight();
    if (areDenSlaversDead())
      this.triggerNextStep();
  }
}

