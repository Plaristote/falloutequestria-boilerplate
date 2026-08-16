import {CharacterBehaviour} from "../character.mjs";
import {SentinelOutcome} from "./flags.mjs";

const datastore = "stable103-rathian-";
const States = {
  Default: 0,
  BeforeClaimSentinel: 1,
  ClaimSentinel: 2,
  Done: 1000
};

export default class Rathian extends CharacterBehaviour {
  constructor(model) {
    super(model);
    this.model.tasks.removeTask("followPlayer");
    this.model.tasks.addUniqueTask("autopilot", 3456, 0);
    if (!this.model.hasVariable(`${datastore}-state`))
      this.state = States.Default;
  }

  get state() { return this.model.getVariable(`${datastore}-state`, 0); }

  set state(value) {
    console.log("RATHIAN UPDATING STATE TO", value, "FROM", this.state);
    this.model.setVariable(`${datastore}-state`, value);
  }

  get dialog() {
    return "stable103/rathian";
  }

  bubble(key, params) {
    return i18n.t(`dialogs.stable103/rathian.bubbles.${key}`, params);
  }

  get sentinelQuest() {
    return game.quests.getQuest("stable-103/rathian");
  }

  get overmare() {
    return level.findObject("overmare");
  }

  get overmareDead() {
    return this.overmare && !this.overmare.isAlive();
  }

  get holdsImprint() {
    return this.sentinelQuest.getVariable("sentinelOutcome", 0) === SentinelOutcome.AppliedToRathian;
  }

  shouldClaimSentinel() {
    return this.overmareDead
      && this.holdsImprint
      && this.state !== States.ClaimSentinel
      && this.state !== States.BeforeClaimSentinel
      && this.state !== States.Done;
  }

  autopilot() {
    if (!this.model.actionQueue.isEmpty() || level.combat || level.script.isTrappedInJail(this.model)) {
      return ;
    }
    console.log("Rathian Autopilot (Stable 103)", this.state);
    if (this.shouldClaimSentinel())
      this.state = States.BeforeClaimSentinel;
    switch (this.state) {
      default:
        console.log("Rathian following playa");
        this.followPlayer(4);
        break ;
      case States.BeforeClaimSentinel:
        console.log("Rathain before claim");
        this.speakAboutClaimSentinelTask();
        break ;
      case States.ClaimSentinel:
        console.log("Rathian claiming");
        this.claimSentinelTask();
        break ;
    }
  }

  speakAboutClaimSentinelTask() {
    const actions = this.model.actionQueue;

    if (actions.isEmpty()) {
      actions.pushSpeak(this.bubble("overmare-is-dead"), 3000, "white");
      actions.pushWait(1);
      actions.pushScript({
        onTrigger: () => { this.state = States.ClaimSentinel; }
      });
      actions.start();
    }
  }

  claimSentinelTask() {
    const terminal = level.findObject("level#2.overmare-room.terminal#1");
    const actions = this.model.actionQueue;

    if (actions.isEmpty()) {
      actions.pushReach(terminal);
      actions.pushSpeak(this.bubble("claiming-sentinel"), 3000, "white");
      actions.pushAnimation("use");
      actions.pushScript({
        onTrigger: () => {
          terminal.script.resolved = true;
          game.setVariable("gameEnding", "sentinel-rathian");
          this.state = States.Done;
          game.gameFinished();
        },
        onCancel: () => {
          this.followPlayer(4);
        }
      });
      actions.start();
    }
  }
}
