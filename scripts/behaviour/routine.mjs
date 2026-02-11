function soonerFirst(a, b) { return a.nextTrigger < b.nextTrigger ? -1 : 1; }
function latestFirst(a, b) { return a.nextTrigger > b.nextTrigger ? -1 : 1; }
function randomInterval() { return 1000 + Math.ceil(Math.random() * 3000); }

const refreshRoutineTaskName = "refreshRoutine";
const updateRoutineTaskName  = "updateRoutine";

function toRoutine(object) {
  if (object) {
    if (object.constructor === RoutineComponent)
      return object;
    else if (object.getScriptObject)
      return toRoutine(object.getScriptObject());
    return object.routineComponent || object.routine;
  }
  return null;
}

export function toggleRoutine(object, value) {
  const routine = toRoutine(object);

  if (routine) {
    if (value === undefined)
      routine.interrupted = !routine.interrupted;
    else
      routine.interrupted = !value;
  }
}

function isBusyCharacter(routine) {
  try {
    return routine.model.getScriptObject().isBusy;
  } catch (err) {
    console.log("routine.mjs: isBusyCharacter: ", err);
  }
  return level.isInCombat(routine.model) || !routine.model.actionQueue.isEmpty();
}

function isBusy(routine) {
  return routine.interrupted
      || (routine.model.type == "Character" && isBusyCharacter(routine));
}

function scheduleRoutineRefresh(routine) {
  routine.model.tasks.addUniqueTask(
    routine.refreshRoutineTaskName,
    routine.refreshInterval + randomInterval(),
    1
  );
}

function refreshRoutine(routine) {
  scheduleRoutineRefresh(routine);
  if (!isBusy(routine)) {
    const callback = routine.getCurrentRoutine().callback;
    if (typeof callback == "function")
      callback(routine.model);
    else
      routine.parent[callback]();
  }
}

export class RoutineComponent {
  constructor(parent, routine, prefix = "") {
    this.parent = parent;
    this.model = parent.model;
    this.routine = routine;
    this.refreshInterval = 4545;
    this.prefix = prefix;
    this.parent[this.updateRoutineTaskName] = this.updateRoutine.bind(this);
    this.parent[this.refreshRoutineTaskName] = () => refreshRoutine(this);
    if (!this.model.tasks.hasTask(this.updateRoutineTaskName))
      this.model.tasks.addTask(this.updateRoutineTaskName, randomInterval(), 1);
  }

  get updateRoutineTaskName() {
    return `${this.prefix}${updateRoutineTaskName}`;
  }

  get refreshRoutineTaskName() {
    return `${this.prefix}${refreshRoutineTaskName}`;
  }

  enablePersistentRoutine() {
    if (!this.model.tasks.hasTask(this.refreshRoutineTaskName))
      scheduleRoutineRefresh(this);
  }

  disablePersistentRoutine() {
    this.model.tasks.removeTask(this.refreshRoutineTaskName);
  }

  getRoutines() {
    const options = [];

    for (var i = 0 ; i < this.routine.length ; ++i) {
      const nextTrigger = game.timeManager.secondsUntilTime(this.routine[i]);

      options.push({ routine: this.routine[i], nextTrigger: parseInt(nextTrigger) * 1000 });
    }
    return options;
  }

  getCurrentRoutine() {
    const options = this.getRoutines().sort(latestFirst);
    return options[0].routine;
  }

  isActiveRoutine(name) {
    const routine = this.getCurrentRoutine();
    return routine.name ? routine.name === name : routine.callback === name;
  }

  scheduleNextRoutineAction() {
    const options = this.getRoutines().sort(soonerFirst);
    this.model.tasks.addTask(this.updateRoutineTaskName, options[0].nextTrigger, 1);
  }

  rescheduleRoutineAction() {
    const calledAt = Date.now();

    // Use real-time to avoid too frequent rescheduling
    if (calledAt - this.rescheduleRoutineActionLastCall > 1000) {
      const timeLeft = this.model.tasks.timeLeft(this.updateRoutineTaskName);
      const interval = game.fastPassTime ? 43210 : 1234;
      if (timeLeft === -1 || timeLeft > interval) {
        this.model.tasks.addTask(this.updateRoutineTaskName, interval, 1);
        this.rescheduleRoutineActionLastCall = calledAt;
      }
    }
  }

  updateRoutine() {
    if (isBusy(this))
      this.rescheduleRoutineAction();
    else
      this.triggerRoutine();
  }

  triggerRoutine() {
    const callback = this.getCurrentRoutine().callback;

    this.scheduleNextRoutineAction();
    if (callback) {
      if (typeof callback == "function")
        callback(this.parent.model);
      else if (typeof callback == "string" && typeof this.parent[callback] == "function")
        this.parent[callback]();
      else
        console.log("triggerRoutine: invalid routine callback", callback);
    }
  }
}
