import {SceneManager} from "../../behaviour/sceneManager.mjs";

// Suggested path: levels/unhaus/backtrackCapture.mjs
//
// Plays out once Backtrack has been led into the hive (see backtrack.mjs's
// followingPlayerToHiveTrap() and unhaus-hive.mjs's startBacktrackCaptureScene()).
//
// The guard party is created and inserted by the level script BEFORE this
// scene is initialized (mirrors rathian-meeting.mjs's bandits/rathian
// parties, which exist ahead of `new MeetingScene(this)` so prepare()'s
// this.actors access is valid at construction time). This scene only
// reads it back via level.script.backtrackCaptureGuards.
//
// Clean run: guards escort Backtrack into jail-cell-4, completing
// unhaus/searching-father's "leadOrKillFather" objective as a success (no
// killedDirectly flag).
//
// If the player (or Backtrack) starts a fight instead, the scripted scene
// aborts, Backtrack turns on the guards alongside the player, and the
// operation counts as blown: unhaus/searching-father is marked compromised,
// which forces the Queen into her angry report-failure line the next time
// she's spoken to. Backtrack himself gets a permanent "exploringHive" flag
// (shared with the honest hive-reveal path in backtrack.mjs) so his own
// dialog opens into the hive-ally hub afterward.
export class BacktrackCaptureScene extends SceneManager {
  constructor(parent) {
    super(parent, "backtrack-capture");
  }

  get backtrack() {
    return game.getCharacter("unhaus/backtrack");
  }

  get guards() {
    return level.script.backtrackCaptureGuards;
  }

  get guardLeader() {
    return this.guards.list[0];
  }

  get actors() {
    return [this.backtrack, ...this.guards.list];
  }

  get states() {
    return [
      this.announceCustody.bind(this),
      this.backtrackReaction.bind(this),
      this.escortBacktrack.bind(this),
      this.resolveCapture.bind(this)
    ];
  }

  announceCustody() {
    const actions = this.guardLeader.actionQueue;

    level.cameraFocusRequired(this.guardLeader);
    this.guardLeader.lookAt(this.backtrack);
    this.backtrack.lookAt(this.guardLeader);
    actions.pushSpeak(this.line("custody-1"), 5000, "white");
    actions.pushWait(5);
    actions.pushSpeak(this.line("custody-2"), 6000, "white");
    actions.pushWait(6);
    actions.pushScript(this.triggerNextStep.bind(this));
    actions.start();
  }

  backtrackReaction() {
    const actions = this.backtrack.actionQueue;

    level.cameraFocusRequired(this.backtrack);
    actions.pushLookAt(game.player);
    actions.pushSpeak(this.line("backtrack-reaction"), 7000, "yellow");
    actions.pushWait(7);
    actions.pushScript({
      onTrigger: this.triggerNextStep.bind(this),
      onCancel: this.triggerNextStep.bind(this)
    });
    actions.start();
  }

  escortBacktrack() {
    console.log("Escort backtrack started");
    const actions = this.guardLeader.actionQueue;

    actions.pushSpeak(this.line("escort"), 3000, "white");
    actions.pushReach(this.backtrack);
    actions.pushWait(3);
    actions.pushScript(this.triggerNextStep.bind(this));
    actions.start();
  }

  resolveCapture() {
    const jailZone = level.getZoneFromName("jail-cell-4");

    level.moveCharacterToZone(this.backtrack, jailZone);
    this.backtrack.inventory.unequipAllItems();
    this.backtrack.inventory.transferTo(level.script.jailShelf.inventory);
    this.backtrack.setAsEnemy(game.player);
    game.quests.getQuest("unhaus/searching-father").script.onLedToTrap();
    this.finalize();
    Array.from(this.guards.list).forEach(character => { level.deleteObject(character); });
  }

  onCombatTurn(character)          { this.startFight(); }
  onDamageTaken(character, dealer) { this.startFight(); }

  startFight() {
    if (this.fightStarted)
      return ;
    this.fightStarted = true;

    this.actors.forEach(actor => actor.actionQueue.reset());
    this.backtrack.setVariable("exploringHive", 1);
    game.diplomacy.setAsEnemy(true, "player", "changeling-hive");
    this.guards.list.forEach(guard => {
      guard.setAsEnemy(this.backtrack);
      guard.fieldOfView.setEnemyDetected(this.backtrack);
      this.backtrack.setAsEnemy(guard);
      this.backtrack.fieldOfView.setEnemyDetected(guard);
      level.joinCombat(guard);
    });
    level.joinCombat(this.backtrack);

    const quest = game.quests.getQuest("unhaus/searching-father");
    if (quest)
      quest.script.onSecrecyCompromised();
    this.finalize();
  }

  finalize() {
    super.finalize();
  }
}
