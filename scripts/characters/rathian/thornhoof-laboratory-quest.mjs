import {CharacterBehaviour} from "../character.mjs";
import {SentinelOutcome} from "./flags.mjs";

const datastore = "thornhoof-laboratory-";
export const States = {
  Default: 0,
  RepairGenerator: 1,
  RepairedGenerator: 2,
  HackLaboratoryTurret: 3,
  Waiting: 4,
  ClaimSentinel: 5,
  ClaimedSentinel: 6,
  Hostile: 7,
  DiscussPlan: 8,
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

  get state() { return this.model.getVariable(`${datastore}-state`); }
  set state(value) { this.model.setVariable(`${datastore}-state`, value); }

  get dialog() {
    return "thornhoof/laboratory/rathian";
  }

  get sentinelQuest() {
    return game.quests.getQuest("stable-103/rathian");
  }

  get wantsSentinelForHimself() {
    return this.model.hasVariable("acquireSentinelWithPlayer") && !this.isConvinced;
  }

  get isConvinced() {
    return this.sentinelQuest.hasVariable("rathianConvinced");
  }

  bubble(key, params) {
    return i18n.t(`dialogs.thornhoof/laboratory/rathian.bubbles.${key}`, params);
  }

  onZoneEntered(zoneName) {
    switch (zoneName) {
    case "generator-zone":
      this.state = States.RepairGenerator;
      break ;
    case "laboratory-entrance":
      this.state = States.HackLaboratoryTurret;
      break ;
    case "laboratory":
      if (this.wantsSentinelForHimself)
        this.state = States.ClaimSentinel;
      break ;
    }
  }

  shouldTurnHostile() {
    return this.isConvinced
      && this.state !== States.Hostile
      && this.state !== States.Done
      && this.sentinelQuest.hasVariable("rathianStoppedPlayer");
  }

  shouldDiscussPlan() {
    const outcome = this.sentinelQuest.getVariable("sentinelOutcome", 0);
    return (outcome === SentinelOutcome.AppliedToRathian || outcome === SentinelOutcome.Destroyed)
      && this.state !== States.Hostile
      && this.state !== States.DiscussPlan
      && this.state !== States.Done
      && !this.sentinelQuest.hasVariable("discussedSentinelPlan");
  }

  autopilot() {
    if (!this.model.actionQueue.isEmpty()) return ;
    console.log("Rathian Autopilot", this.state);
    if (this.shouldTurnHostile())
      this.state = States.Hostile;
    else if (this.shouldDiscussPlan())
      this.state = States.DiscussPlan;
    switch (this.state) {
      case States.Default:
      case States.ClaimedSentinel:
        this.followPlayer(4);
        break ;
      case States.RepairGenerator:
        this.repairGeneratorTask();
        break ;
      case States.RepairedGenerator:
        this.hackGeneratorTerminal();
        break ;
      case States.HackLaboratoryTurret:
        this.hackLaboratoryTurret();
        break ;
      case States.ClaimSentinel:
        this.claimSentinelTask();
        break ;
      case States.DiscussPlan:
        this.discussPlanTask();
        break ;
      case States.Hostile:
        this.betrayPlayer();
        break ;
    }
  }

  repairGeneratorTask() {
    const generator = level.findObject("1.generator-room.generator#1");
    const actions = this.model.actionQueue;

    if (generator.script.running)
      this.state = States.Default;
    else if (actions.isEmpty()) {
      actions.pushSpeak(this.bubble("lets-repair-generator"), 3000, "white");
      actions.pushWait(1);
      actions.pushReach(generator);
      actions.pushAnimation("use");
      actions.pushScript({
        onTrigger: () => {
          generator.script.toggleRunning();
          this.state = States.RepairedGenerator;
        },
        onCancel: () => {
        }
      });
      actions.start();
    }
  }

  hackGeneratorTerminal() {
    const terminal = level.findObject("1.generator-room.terminal");
    const actions = this.model.actionQueue;

    if (terminal.script.hacked) this.state = States.Default;
    if (!terminal.script.hacked && actions.isEmpty()) {
      actions.pushReach(terminal);
      actions.pushLookAt(terminal);
      actions.pushWait(1);
      actions.pushAnimation("use");
      actions.pushScript({
        onTrigger: () => {
          terminal.script.hacked = true;
          this.state = States.Default;
        }
      });
      actions.pushSpeak(this.bubble("hacked-generator-terminal"), 3000, "white");
      actions.start();
    }
  }

  hackLaboratoryTurret() {
    const terminal = level.findObject("2.laboratory.terminal");
    const turret = level.script.laboratoryTurret;
    const actions = this.model.actionQueue;

    if (terminal.script.hacked) this.state = States.Default;
    if (!terminal.script.hacked && actions.isEmpty()) {
      actions.pushSpeak(this.bubble("lets-hack-turret"), 3000, "white");
      actions.pushWait(1);
      actions.pushReach(terminal);
      actions.pushAnimation("use");
      actions.pushScript({
        onTrigger: () => {
          turret.script.popUp();
          turret.statistics.faction.popUp();
          terminal.script.hacked = true;
          this.state = States.Default;
        }
      });
      actions.start();
    }
  }

  claimSentinelTask() {
    const terminal = level.findObject("2.laboratory.terminal#1");
    const actions = this.model.actionQueue;

    if (terminal.script.sentinelResolved) {
      this.state = States.ClaimedSentinel;
      return ;
    }
    if (actions.isEmpty()) {
      actions.pushSpeak(this.bubble("claiming-sentinel"), 3000, "white");
      actions.pushWait(1);
      actions.pushReach(terminal);
      actions.pushAnimation("use");
      actions.pushScript({
        onTrigger: () => {
          terminal.script.sentinelResolved = true;
          this.sentinelQuest.setVariable("sentinelOutcome", SentinelOutcome.AppliedToRathian);
          this.sentinelQuest.completeObjective("dealWithRathian");
          this.state = States.DiscussPlan;
        }
      });
      actions.start();
    }
  }

  discussPlanTask() {
    const actions = this.model.actionQueue;
    const outcome = this.sentinelQuest.getVariable("sentinelOutcome");
    let dialogState;

    switch (outcome) {
    case SentinelOutcome.AppliedToRathian:
      dialogState = "aftermath/claimed/entry";
      break ;
    default:
      dialogState = "aftermath/destroyed/entry";
      break ;
    }

    if (actions.isEmpty()) {
      actions.pushReach(game.player);
      actions.pushScript({
        onTrigger: () => {
          this.state = States.ClaimedSentinel;
          level.initializeDialog(this.model, this.dialog, dialogState);
        }
      });
      actions.start();
    }
  }

  betrayPlayer() {
    const actions = this.model.actionQueue;

    if (actions.isEmpty()) {
      actions.pushSpeak(this.bubble("betrayal"), 3000, "white");
      actions.pushScript({
        onTrigger: () => {
          game.playerParty.removeCharacter(this.model);
          this.model.statistics.faction = "rathian";
          game.player.setAsEnemy(this.model);
          this.model.setAsEnemy(game.player);
          this.state = States.Done;
        }
      });
      actions.start();
    }
  }
}
