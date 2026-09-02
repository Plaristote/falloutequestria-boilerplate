import Base from "./base.mjs";
import toLevelExitAction from "../components/pathfinding/goToLevelExit.mjs";

function isDropOffLevel() {
  const city = worldmap.getCurrentCity();
  const levelName = typeof level != "undefined" ? level.name : "";
  const exceptionLevel = ["junkville-cavern", "junkville-underground", "junkville-dumps"];

  return city !== null && exceptionLevel.indexOf(levelName) == -1;
}

export default class Rathian extends Base {
  get dialog() {
    return "rathian-introduction";
  }
  
  get textBubbles() {
    return [
      {content: i18n.t("dialogs.rathian-introduction.text-bubbles.0"), duration: 1400, color: "lightgreen"},
      {content: i18n.t("dialogs.rathian-introduction.text-bubbles.1"), duration: 1800, color: "lightgreen"}
    ];
  }

  isInPlayerParty() {
    return game.playerParty.find(character => { return character === this.model }) != null;
  }

  mitigateDamage(damage, type, dealer) {
    if (!this.isInPlayerParty()) {
      damage = 1;
    }
    return super.mitigateDamage(damage, type, dealer);
  }

  insertedIntoZone(zoneName) {
    console.log("Rathian inserted into zone", level.name, zoneName);
    if (isDropOffLevel()) {
      console.log("Rathian dropping ovv");
      game.playerParty.removeCharacter(this.model);
      this.stopFollowingPlayer();
      this.model.movementMode = "walking";
      this.model.tasks.addTask("talkOnArrival", 1000, 1);
      if (level.name === "junkville") {
        level.setVariable("rathianPrepared", true);
        this.model.actionQueue.pushMovement(53, 27);
        this.model.actionQueue.start();
        this.model.tasks.addTask("switchScript", 1500, 1);
      } else {
        console.log("Rathian getting deleted");
        this.model.tasks.addTask("removeRathian", 1500, 1);
      }
    }
  }

  talkOnArrival() {
    console.log("TRIGGER TALK ON ARRIVAL");
    if (!level.combat) {
      this.talkedOnArrival = true;
      level.initializeDialog(this.model, "rathian-junkville-arrival");
    }
    else
      this.model.tasks.addTask("talkOnArrival", 1000, 1);
  }

  switchScript() {
    console.log("TRIGGER WITCHCRIPT");
    if (this.talkedOnArrival) {
      this.model.tasks.addTask("moveToHome", 10000, 0);
      this.model.setScript("rathian/junkville.mjs");
    }
    else
      this.model.tasks.addTask("switchScript", 1500, 1);
  }

  removeRathian() {
    console.log("TRIGGER REMOVAL");
    if (this.talkedOnArrival)
      this.model.tasks.addTask("goToLevelExit", 1000, 1);
    else
      this.model.tasks.addTask("removeRathian", 1500, 1);
  }

  goToLevelExit() {
    const reschedule = () => this.model.tasks.addTask("goToLevelExit", 5000, 1);

    toLevelExitAction(this.model, reschedule);
  }
}
