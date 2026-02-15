import {LevelBase} from "./base.mjs";
import {AlarmLevel, callGuards} from "../characters/components/alarm.mjs";

export default class extends LevelBase {
  onLoaded() {
    super.onLoaded();
    if (this.rathianQuest.isObjectiveCrossedOff("dealWithRathian"))
      this.initializePreEndGameScene();
  }

  get rathianQuest() {
    return game.quests.getQuest("stable-103/rathian");
  }

  get overmare() {
    return level.findObject("overmare");
  }

  get guards() {
    return level.findGroup("guards");
  }

  moveCharacterToJail(character) {
    const door = level.findObject("level#0.jail.door");

    door.opened = false;
    door.locked = true;
    level.moveCharacterToZone(character, "containment-cell", 0);
    game.playerParty.removeCharacter(character);
  }

  initializePreEndGameScene() {
    let guardIndex = 0;
    this.guards.objects.forEach(guard => {
      level.setCharacterPosition(guard, 32 + guardIndex, 47, 0);
      guardIndex++;
    });
    level.tasks.addUniqueTask("startPreEndGameDialog", 1, 1);
  }

  startPreEndGameDialog() {
    level.initializeDialog(this.guards.objects[0], "stable103/guards-end-scene");
  }

  initializeEndGameScene() {
    let guardIndex = 0;

    level.setCharacterPosition(this.overmare, 29, 25, 2);
    level.insertPartyIntoZone(game.playerParty, "overmare-office");
    this.guards.objects.forEach(guard => {
      level.setCharacterPosition(guard, 27 + guardIndex, 21, 2);
      guardIndex++;
    });
    level.initializeDialog(this.overmare, "stable103/overmare-end-scene");
  }

  startFight() {
    game.diplomacy.setAsEnemy(true, "player", "stable-103");
    callGuards(this.guards, game.player, AlarmLevel.ShootOnSight);
  }
}
