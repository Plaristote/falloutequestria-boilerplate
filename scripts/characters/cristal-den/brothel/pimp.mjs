import {CharacterBehaviour} from "./../../character.mjs";
import {AlarmLevel} from "../../components/alarm.mjs";
import {RoutineComponent} from "../../../behaviour/routine.mjs";
import {QuestFlags, requireQuest} from "../../../quests/helpers.mjs";
import {explode} from "../../../behaviour/explosion.mjs";

const routine = [
  { hour: "4",  name: "night",  callback: "runSleepRoutine" },
  { hour: "11", name: "office", callback: "runOfficeRoutine" },
  { hour: "18", name: "patrol", callback: "runPatrolRoutine" }
];

function randomWordsOfEncouragement() {
  const prefix = "dialogs.cristal-den/brothel/pimp";
  const makeText = function(key) { return i18n.t(`${prefix}.${key}`); };
  const choices = [
    { text: makeText("encouragement-1"), duration: 3500 },
    { text: makeText("encouragement-2"), duration: 4500 },
    { text: makeText("encouragement-3"), duration: 4000 },
    { text: makeText("encouragement-4"), duration: 5000 }
  ];
  return choices[Math.floor(Math.random() * choices.length)];
}

export default class Pimp extends CharacterBehaviour {
  constructor(model) {
    super(model);
    this.routineComponent = new RoutineComponent(this, routine);
    this.routineComponent.enablePersistentRoutine();
    this.dialog = "cristal-den/brothel/pimp";
  }

  get bed() {
    return typeof level != "undefined" ? level.findObject("brothel.pimps.room.bed") : null;
  }

  get rooms() {
    const rooms = level.findGroup("brothel.rooms");
    return rooms.groups;
  }

  get workers() {
    return Array.from(this.rooms).map(function(room) {
      return room.findObject("worker");
    }).filter(function(worker) {
      return worker && worker.isAlive();
    });
  }

  get freeWorkers() {
    return this.workers.filter(function(worker) {
      return worker && worker.script?.workInProgress != true;
    });
  }

  onDied() {
    const quest = requireQuest("cristal-den/pimp-changeling", QuestFlags.HiddenQuest);
    quest.script.onPimpKilled();
  }

  runSleepRoutine() {
    if (this.model.getDistance(this.bed) >= 2) {
      const actions = this.model.actionQueue;
      actions.pushReach(this.bed);
      actions.pushScript(function() {
        const officeDoor = level.findObject("brothel.pimps.door");
        const roomDoor   = level.findObject("brothel.pimps.room.door");
        roomDoor.opened = officeDoor.opened = false;
        officeDoor.locked = true;
      });
      actions.start();
    }
  }

  runOfficeRoutine() {
    if (this.model.position.x !== 6 || this.model.position.y !== 6) {
      const actions = this.model.actionQueue;
      actions.pushMovement(6, 6);
      actions.pushScript({
        onTrigger: function() {
          const door = level.findObject("brothel.pimps.door");
          door.locked = false;
        }
      });
      actions.start();
    }
  }

  runPatrolRoutine() {
    const officeDoor = level.findObject("brothel.pimps.door");

    officeDoor.opened = false;
    officeDoor.locked = true;
    this.model.tasks.addUniqueTask("runPatrol", 5000, 1);
  }

  runPatrol() {
    const actions = this.model.actionQueue;

    if (!this.routineComponent.isActiveRoutine("patrol"))
      return ;
    else if (actions.isEmpty()) {
      const candidates = this.freeWorkers;
      const pick = Math.floor(Math.random() * candidates.length);
      const worker = candidates[pick];
      const wordOfEncouragement = randomWordsOfEncouragement();

      actions.pushReach(worker, 2);
      actions.pushLookAt(worker);
      actions.pushSpeak(wordOfEncouragement.text, wordOfEncouragement.duration, wordOfEncouragement.color || "white");
      actions.pushWait(wordOfEncouragement.duration / 1000 + 2);
      actions.pushScript(this.runPatrolRoutine.bind(this));
      actions.start();
    }
    else
      this.model.tasks.addUniqueTask("runPatrol", 5000, 1);
  }

  callGuardsOn(target) {
    const position = this.model.position;
    const guards = [level.findObject("brothel.staff#1"), level.findObject("brothel.staff#2")];

    guards.forEach(guard => {
      if (!guard.hasVariable("distracted")) {
        console.log("ALARM SIGNAL SENT TO GUARD", target, "level=", AlarmLevel.ShootOnSight);
        guard.script.alarmComponent.receiveAlarmSignal(position.x, position.y, 0, target, AlarmLevel.ShootOnSight);
      }
    });
    this.model.setAsEnemy(target);
  }

  startLookForPetiole() {
    this.routineComponent.disablePersistentRoutine();
    this.model.tasks.addUniqueTask("runLookForPetiole", 500, 1);
  }

  startHuntingPetiole() {
    this.model.tasks.addUniqueTask("runHuntingPetiole", 500, 1);
  }

  runLookForPetiole() {
    const actions = this.model.actionQueue;
    const dumpster = level.findObject("brothel.dumpster");

    actions.pushReachCase(11, 1, 2);
    actions.pushReachCase(3, 1, 1);
    actions.pushScript({
      onTrigger: () => { this.triggerPetioleTrap(); },
      onCancel: () => { this.model.tasks.addUniqueTask("runLookForPetiole", 500, 1); }
    });
    actions.start();
  }

  runHuntingPetiole() {
    const actions = this.model.actionQueue;
    const petiole = level.findObject("brothel.petiole");
    const onFinished = () => { this.routineComponent.enablePersistentRoutine(); }

    if (petiole) {
      actions.pushReach(petiole, 3);
      actions.pushScript({
        onTrigger: () => {
          this.callGuardsOn(petiole);
          onFinished();
        },
        onCancel: () => { this.model.tasks.addUniqueTask("runHuntingPetiole", 1000, 1); }
      });
      actions.start();
    } else {
      onFinished();
    }
  }

  triggerPetioleTrap() {
    const quest = requireQuest("cristal-den/pimp-changeling");
    if (quest.script.trapEnabled) {
      explode({ x: this.model.position.x, y: this.model.position.y, z: 0 }, 1, 50, this.model, null) ;
    } else {
      this.startHuntingPetiole();
    }
  }
}
