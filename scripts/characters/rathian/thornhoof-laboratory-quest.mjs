import {CharacterBehaviour} from "../character.mjs";

const datastore = "thornhoof-laboratory-";
export const States = {
  Default: 0,
  RepairGenerator: 1,
  RepairedGenerator: 2,
  HackLaboratoryTurret: 3,
  Waiting: 4,
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
      break ;
    }
  }

  autopilot() {
    if (!this.model.actionQueue.isEmpty()) return ;
    console.log("Rathian Autopilot", this.state);
    switch (this.state) {
      case States.Default:
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
    }
  }

  repairGeneratorTask() {
    const generator = level.findObject("1.generator-room.generator#1");
    const actions = this.model.actionQueue;

    if (generator.script.enabled) this.state = States.Default;
    if (!generator.script.enabled && actions.isEmpty()) {
      actions.pushSpeak(this.bubble("lets-repair-generator"), 3000, "white");
      actions.pushWait(1);
      actions.pushReach(generator);
      actions.pushAnimation("use");
      actions.pushScript({
        onTrigger: () => {
          console.log("Coucou petite perruche #1");
          generator.script.toggleRunning();
          console.log("Coucou petite perruche #2");
          this.state = States.RepairedGenerator;
          console.log("Coucou petite perruche #3");
        },
        onCancel: () => {
          console.log("Oops canceled !!!!!!");
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
}
