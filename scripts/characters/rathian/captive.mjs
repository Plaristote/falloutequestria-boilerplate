import Base from "./base.mjs";
import {overrideBehaviour} from "../../behaviour/override.mjs";

export const DealWithRathian = {
  LeaveBehind: 1,
  HelpLeave: 2,
  CellOpened: 4,
  LeftWithPlayer: 8,
  GaveUpSentinel: 16
};

function enemyBubbles() {
  return [
    { content: i18n.t("dialogs.rathian-captive.bubbles.hostile#1"), duration: 3500, color: "red" },
    { content: i18n.t("dialogs.rathian-captive.bubbles.hostile#2"), duration: 4000, color: "red" }
  ];
}

function escapeAloneBubbles() {
  return [
    { content: i18n.t("dialogs.rathian-captive.bubbles.alone#1"), duration: 3000, color: "lightblue" },
    { content: i18n.t("dialogs.rathian-captive.bubbles.alone#2"), duration: 3000, color: "lightblue" },
    { content: i18n.t("dialogs.rathian-captive.bubbles.alone#3"), duration: 3000, color: "lightblue" }
  ];
}

function escapeWithPlayerBubbles() {
  return [
    { content: i18n.t("dialogs.rathian-captive.bubbles.helped#1"), duration: 3000, color: "yellow" },
    { content: i18n.t("dialogs.rathian-captive.bubbles.helped#2"), duration: 3000, color: "yellow" },
    { content: i18n.t("dialogs.rathian-captive.bubbles.helped#3"), duration: 3000, color: "yellow" }
  ];
}

export default class Rathian extends Base {
  constructor(model) {
    super(model);
    this.model.attacksOnSight = false;
    this.model.statistics.faction = "rathian";
    this.model.tasks.addTask("initializeDoorWatch", 100, 1);
  }

  initializeDoorWatch() {
    overrideBehaviour(this.cellDoor.script,                 "onBustOpen",   this.onCellDoorOpening.bind(this));
    overrideBehaviour(this.cellDoor.script.lockedComponent, "toggleLocked", this.beforeCellDoorLockToggle.bind(this))
  }

  get dealWithRathianFlag() {
    return this.model.getVariable("dealWithRathian", 0);
  }

  toggleDealWithRathianFlag(value) {
    this.model.setVariable("dealWithRathian", this.dealWithRathianFlag | value);
  }

  beforeCellDoorLockToggle() {
    const cellZone = level.getZoneFromName("rathian-cell");
    if (this.cellDoor.locked) // unloking
      this.onCellDoorOpening();
    else if (level.isInsideZone(cellZone, this.model)) {
      this.attacksOnSight = false;
      if ((this.dealWithRathianFlag & DealWithRathian.CellOpened) > 0)
        this.model.setVariable("dealWithRathian", this.dealWithRathianFlag - DealWithRathian.CellOpened);
    }
  }

  onCellDoorOpening() {
    console.log("onCellDoorOpening called");
    this.attacksOnSight = true;
    this.toggleDealWithRathianFlag(DealWithRathian.CellOpened);
    if ((this.dealWithRathianFlag & DealWithRathian.HelpLeave) > 0)
      this.escapeWithPlayer();
    return false;
  }

  onInvitedToEscape() {
    this.toggleDealWithRathianFlag(DealWithRathian.HelpLeave);
    if ((this.dealWithRathianFlag & DealWithRathian.CellOpened) > 0)
      this.escapeWithPlayer();
    return true;
  }

  onEscapedWithPlayer() {
    this.toggleDealWithRathianFlag(DealWithRathian.LeftWithPlayer);
  }

  escapeWithPlayer() {
    game.playerParty.addCharacter(this.model);
    this.retrieveItems(() => {
      this.model.tasks.addUniqueTask("followPlayer", 2323, 0);
    });
  }

  retrieveItems(callback) {
    const actions = this.model.actionQueue;
    const shelf = level.findObject("police-station.cells.storage-chest");
    if (actions.isEmpty() && shelf) {
      actions.pushWait(1);
      actions.pushReach(shelf);
      actions.pushLookAt(shelf);
      actions.pushAnimation("use");
      actions.pushScript({
        onTrigger: () => {
          shelf.inventory.transferTo(this.model.inventory);
          callback();
        },
        onCancel: () => {
          this.model.tasks.addUniqueTask("retrieveItems", 500, 1);
        }
      });
    }
  }

  get cellDoor() {
    return level.findObject("police-station.cells.cell#1.door#1");
  }

  get leftToEscapeAlone() {
    const leftBehindFlag = DealWithRathian.LeaveBehind + DealWithRathian.CellOpened;
    return ((this.dealWithRathianFlag & leftBehindFlag) == leftBehindFlag);
  }

  get dialog() {
    if (this.model.isEnemy(game.player))
      return null;
    if (game.playerParty.containsCharacter(this.model) || this.leftToEscapeAlone)
      return null;
    return "rathian-captive";
  }

  get textBubbles() {
    if (this.model.isEnemy(game.player))
      return enemyBubbles();
    if (this.leftToEscapeAlone)
      return escapeAloneBubbles();
    return escapeWithPlayerBubbles();
  }
}
