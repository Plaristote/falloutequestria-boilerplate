import {LevelBase} from "./base.mjs";
import {requireQuest} from "../quests/helpers.mjs";

const faction = "stabletech-facility";

export class JunkvilleStabletechFacility extends LevelBase {
  initialize() {
    game.diplomacy.addFaction(faction);
    this.setSecurityEnabled(true);
    this.guards.forEach(guard => { guard.statistics.faction = faction; });
  }

  onLoaded() {
    const generator = level.findObject("generator-room.generator");
    const quest = requireQuest("junkvilleStabletechFacility");
    quest.script.loadJunkvilleFacility();
    this.togglePower(generator.script.running);
  }

  onZoneEntered(zoneName, object) {
    if (object === game.player && zoneName === "stock-room")
      requireQuest("junkvilleStabletechFacility").completeObjective("explore-facility");
    if (object.objectName.startsWith("Rathian"))
      object.script.onZoneEntered(level.getTileZone(zoneName));
  }

  setSecurityEnabled(value) {
    game.diplomacy.setAsEnemy(value, faction, "player");
  }

  isSecurityEnabled() {
    return game.diplomacy.areEnemies(faction, "player");
  }

  togglePower(running) {
    this.model.useAmbientLight = !running;
    this.commandTerminal.script.enabled = this.running;
    this.guards.forEach(sentinel => {
      if (running) {
        sentinel.wakeUp();
        sentinel.setAnimation("get-up");
      }
      else {
        sentinel.fallUnconscious();
        sentinel.setAnimation("fall-down");
      }
    });
  }

  get commandTerminal() {
    return level.findObject("control-room.terminal");
  }

  get guards() {
    const object = level.findGroup("security-room").objects;
    const result = [];

    for (let i = 0 ; i < object.length ; ++i) {
      if (object[i].getObjectType() === "Character" && object[i].isAlive())
        result.push(object[i]);
    }
    return result;
  }
}

export function create(model) {
  return new JunkvilleStabletechFacility(model);
}
