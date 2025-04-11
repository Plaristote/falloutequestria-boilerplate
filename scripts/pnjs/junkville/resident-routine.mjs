
function dayRoutine(model) {
  const dayX = model.getVariable("dayX");
  const dayY = model.getVariable("dayY");
  const { x, y } = model.position;
  if (x != dayX || y != dayY) {
    model.actionQueue.pushMovement(dayX, dayY, 0);
    model.actionQueue.start();
  }
}

function assemblyRoutine(model) {
  const zone = game.level.getZoneFromName("ekklesia");
  if (zone && !game.level.isInsideZone(zone, model)) {
    model.actionQueue.pushMoveToZone(zone);
    model.actionQueue.pushScript({
      onTrigger: function() {},
      onCancel: function() {
        model.script.routineComponent.rescheduleRoutineAction();
      }
    });
    model.actionQueue.start();
  }
}

function nightRoutine(model) {
  if (model.script.bed) {
    model.actionQueue.pushReach(model.script.bed);
    model.actionQueue.start();
  } else {
    dayRoutine(model);
  }
}

export const routine = [
  { hour: "7",  name: "daily",    callback: dayRoutine },
  { hour: "21", name: "assembly", callback: assemblyRoutine },
  { hour: "23", name: "nightly",  callback: nightRoutine }
];

export function initializeRoutineUser(model) {
  model.setVariable("dayX", model.position.x);
  model.setVariable("dayY", model.position.y);
}
