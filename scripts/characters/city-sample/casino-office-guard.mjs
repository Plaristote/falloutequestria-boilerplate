import {CasinoGuard} from "./casino-guard.mjs";
import {overrideBehaviour} from "../../behaviour/override.mjs";

const textBubbles = {
  goToOffice:     { content: i18n.t("sample-city.director-not-receiving"), duration: 3500, color: "orange" },
  goToRestaurant: { content: i18n.t("sample-city.director-at-lunch"), duration: 4500, color: "orange" }
};

function onPreventDoorOpening(self, currentRoutine) {
  const bubble = textBubbles[currentRoutine];

  level.addTextBubble(self, bubble.content, bubble.duration, bubble.color);
}

function onDoorOpening(self, director, user) {
  if (user === game.player && self.isAlive() && self.fieldOfView.isDetected(user) && self.hasLineOfSight(user)) {
    const currentRoutine = director.routineComponent.getCurrentRoutine().callback;
    switch (currentRouine) {
      case "goToOffice":
      case "goToRestaurant":
        onPreventDoorOpening(self, currentRoutine);
        return true;
    }
  }
  return false;
}

class CasinoOfficeGuard extends CasinoGuard {
  constructor(model) {
    super(model);
    this.model.tasks.addTask("initializeDoorWatch", 100, 1);
  }
  
  initializeDoorWatch() {
    const door = level.findObject("casino.director-office.door").getScriptObject();
    const director = level.findObject("casino.director").getScriptObject();

    overrideBehaviour(door, "onUse", onDoorOpening.bind(this, this.model, director));
  }
}

export function create(model) {
  return new CasinoOfficeGuard(model);
}
