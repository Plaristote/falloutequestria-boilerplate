import {SceneManager} from "../behaviour/sceneManager.mjs";
 
export class MeetingScene extends SceneManager {
  constructor(parent) {
    super(parent, "rathian-meeting");
  }

  get bandits() {
    return level.script.bandits;
  }

  get rathian() {
    return level.script.rathianParty;
  }

  get actors() {
    const array = [this.rathian.list[0]];
    for (let i = 0 ; i < this.bandits.list.length ; ++i)
      array.push(this.bandits.list[i]);
    return array;
  }

  get banditLeader() {
    return this.bandits.list[0];
  }

  get states() {
    return [
      this.startAmbush.bind(this),
      this.rathianArrival.bind(this),
      this.leaderReaction.bind(this),
      this.rathianResponds.bind(this),
      this.leaderReaction2.bind(this),
      this.triggerCombat.bind(this)
    ];
  }

  startAmbush() {
    const actionQueue = this.banditLeader.actionQueue;
    for (let i = 0 ; i < this.bandits.list.length ; ++i)
      this.bandits.list[i].lookAt(game.player);
    game.player.lookAt(this.banditLeader);
    actionQueue.pushSpeak(this.line("startAmbush#1"), 3000, "lightgreen");
    actionQueue.pushWait(3);
    actionQueue.pushSpeak(this.line("startAmbush#2"), 8000, "lightgreen");
    actionQueue.pushWait(8);
    actionQueue.pushSpeak(this.line("startAmbush#3"), 8000, "lightgreen");
    actionQueue.pushWait(8);
    actionQueue.pushScript(this.triggerNextStep.bind(this));
    actionQueue.start();
  }

  rathianArrival() {
    console.log("Wait, what ?");
    const rathian = this.rathian.list[0];
    const actionQueue = rathian.actionQueue;
    this.insertRathian();
    level.cameraFocusRequired(rathian);
    actionQueue.pushSpeak(this.line("rathianArrival"), 5000, "yellow");
    actionQueue.pushMovement(35, 21);
    actionQueue.pushScript(this.triggerNextStep.bind(this));
    actionQueue.start();
  }

  leaderReaction() {
    const actionQueue = this.banditLeader.actionQueue;
    level.cameraFocusRequired(this.banditLeader);
    actionQueue.pushSpeak(this.line("leaderReaction"), 6000, "red");
    actionQueue.pushWait(6);
    actionQueue.pushScript(this.triggerNextStep.bind(this));
    actionQueue.start();
  }

  rathianResponds() {
    const rathian = this.rathian.list[0];
    const actionQueue = this.rathian.list[0].actionQueue;
    level.cameraFocusRequired(rathian);
    actionQueue.pushSpeak(this.line("rathianResponds"), 8000, "yellow");
    actionQueue.pushWait(8);
    actionQueue.pushScript(this.triggerNextStep.bind(this));
    actionQueue.start();
  }

  leaderReaction2() {
    const actionQueue = this.banditLeader.actionQueue;
    level.cameraFocusRequired(this.banditLeader);
    actionQueue.pushSpeak(this.line("leaderReaction2#1"), 7000, "red");
    actionQueue.pushWait(7);
    actionQueue.pushSpeak(this.line("leaderReaction2#2"), 7000, "red");
    actionQueue.pushWait(7);
    actionQueue.pushScript(this.triggerNextStep.bind(this));
    actionQueue.start();
  }

  onCombatTurn(character)          { this.triggerCombat(); }
  onDamageTaken(character, dealer) { this.triggerCombat(); }

  triggerCombat() {
    this.actors.forEach(function (actor) { actor.actionQueue.reset(); });
    this.finalize();
  }

  playerEscaping() {
    level.addTextBubble(this.banditLeader, this.line("playerEscaping"), 10000, "red");
    this.finalize();
  }

  insertRathian() {
    if (!level.hasVariable("rathianLoaded")) {
      this.rathian.insertIntoZone(level, "rathian-entry");
      level.setVariable("rathianLoaded", true);
      game.player.fieldOfView.setCharacterDetected(this.rathian.list[0]);
    }
  }
	
  rathianAttack() {
    const rathian = this.rathian.list[0];

    this.insertRathian();
    level.cameraFocusRequired(rathian);
    level.addTextBubble(rathian, this.line("rathianAttack"), 4000, "white");
    game.setFactionAsEnemy("player", "bandits", true);
    rathian.actionQueue.reset();
    rathian.setAsEnemy(this.banditLeader);
    level.joinCombat(rathian);
    for (let i = 0 ; i < this.bandits.list.length ; ++i) {
      const bandit = this.bandits.list[i];
      bandit.fieldOfView.setEnemyDetected(game.player);
      bandit.fieldOfView.setEnemyDetected(this.rathian.list[0]);
      level.joinCombat(bandit);
      bandit.getScriptObject().combatTarget = i == 0 ? game.player : rathian;
    }
    rathian.getScriptObject().combatTarget = this.bandits[1];
  }

  finalize() {
    super.finalize();
    this.rathianAttack();
  }
}
