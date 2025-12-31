import {LevelBase} from "./base.mjs";
import {laboratoryElevatorPrompt} from "./components/thornhoofLaboratory.mjs";
import {requireQuest, QuestFlags} from "../quests/helpers.mjs";

const faction = "thornhoof-laboratory-security";
const ghoulFaction = "thornhoof-laboratory-ghouls";

function useElevatorB(floor) {
  level.insertPartyIntoZone(game.playerParty, `elevator-B-${floor}-entrance`);
}

function rathian() {
  return game.getCharacter("rathian");
}

export default class extends LevelBase {
  constructor(model) {
    super(model);
    level.tasks.addUniqueTask("updateTurrets", 100, 1);
  }

  initialize() {
    requireQuest("thornhoof/scrollQuest", QuestFlags.HiddenQuest);
    game.diplomacy.addFaction(faction);
    game.diplomacy.addFaction(ghoulFaction);
    game.diplomacy.setAsEnemy(true, ghoulFaction, "player");
    this.guards.forEach(guard => guard.fallUnconscious());
    this.guards.forEach(guard => guard.statistics.faction = faction);
    this.ghouls.forEach(ghoul => ghoul.statistics.faction = ghoulFaction);
  }

  onLoaded() {
    console.log("ON LABORATORY LOADED");
    console.log("IS IN PARTY?", game.playerParty.containsCharacter(rathian()));
    if (game.playerParty.containsCharacter(rathian()))
      rathian().setScript("rathian/thornhoof-laboratory-quest.mjs");
  }

  onExit() {
    if (game.playerParty.containsCharacter(rathian()))
      rathian().setScript("rathian/captive");
  }

  setPowerEnabled(value) {
    level.setVariable("power", value ? 1 : 0);
    level.ambientColor = value ? "#322c2987" : "#530a0404";
    this.onSecurityUpdated();
    this.updateTurrets();
    this.terminals.forEach(terminal => terminal.script?.onEnabledChanged());
    this.guards.forEach(guard => value ? guard.wakeUp() : guard.fallUnconscious());
  }

  updateTurrets() {
    this.turrets.forEach(turret => {
      if (turret.isAlive()) {
        this.powerEnabled ? turret.script.popUp() : turret.script.popDown();
      }
    });
  }

  removeStaffRegistrations() {
    this.staffRegistrationRemoved = true;
    this.onSecurityUpdated();
  }

  onSecurityUpdated() {
    game.diplomacy.setAsEnemy(this.powerEnabled && this.staffRegistrationRemoved, faction, ghoulFaction);
    game.diplomacy.setAsEnemy(this.powerEnabled && !this.registeredAsStaff, faction, "player");
  }

  onZoneEntered(zoneName, character) {
    const elevatorA = ["entrance-elevator"];
    const elevatorB = ["elevator-B-1", "elevator-B-0"];
    if (character == game.player) {
      if (elevatorA.indexOf(zoneName) >= 0)
        laboratoryElevatorPrompt(1);
      else if (elevatorB.indexOf(zoneName) >= 0)
        this.onElevatorBEntered();
    } else if (character == game.getCharacter("rathian")) {
      character.script.onZoneEntered(zoneName);
    }
  }

  onElevatorBEntered() {
    game.openPrompt(i18n.t("elevator-prompt"), [
      { label: "1", callback: useElevatorB.bind(this, 0) },
      { label: "2", callback: useElevatorB.bind(this, 1) }
    ]);
  }

  get powerEnabled() {
    return level.getVariable("power", 0) == 1;
  }

  get guards() {
    return level.findGroup("robots").find("*.*");
  }

  get turrets() {
    return level.findGroup("robots").find("turrets.*");
  }

  get laboratoryTurret() {
    return level.findObject("2.laboratory.turret");
  }

  get ghouls() {
    return level.findGroup("ghouls").find("*.*");
  }

  get securityEnabled() {
    return level.getVariable("securityEnabled", 1) == 1;
  }

  set securityEnabled(value) {
    level.setVariable("securityEnabled", value ? 1 : 0);
  }

  get registeredAsStaff() {
    return level.getVariable("registeredAsStaff", 0) == 1;
  }

  set registeredAsStaff(value) {
    level.setVariable("registeredAsStaff", value ? 1 : 0);
    this.onSecurityUpdated();
  }

  get staffRegistrationRemoved() {
    return level.getVariable("staffRegistrationRemoved", 0) == 1;
  }

  set staffRegistrationRemoved(value) {
    level.setVariable("staffRegistrationRemoved", value ? 1 : 0);
    if (value)
      this.registeredAsStaff = !value;
  }

  get terminals() {
    let list = [];
    list.push(level.findObject("1.generator-room.terminal"));
    list.push(level.findObject("2.laboratory.terminal"));
    list.push(level.findObject("2.laboratory.terminal#1"));
    list.push(level.findObject("2.laboratory.terminal#2"));
    list.push(level.findObject("2.annex#2.terminal"));
    return list;
  }
}
