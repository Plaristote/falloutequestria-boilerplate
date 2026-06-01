class Dialog {
  constructor(dialog) {
    this.dialog = dialog;
    this.dialog.ambiance = "cavern";
    this.dialog.npc.setVariable("met", true);
    level.setVariable("player-known", 1);
  }
  
  canConvinceNotToKill() {
    return game.player.statistics.speech > 68;
  }
  
  moveToLeader() {
    const meetingPlace = level.findGroup("leader-meeting");
    const leader = level.findObject("dog-leader");

    game.player.sneaking = false;
    game.playerParty.insertIntoZone(level, meetingPlace.controlZone);
    level.setCharacterPosition(leader, 8, 52);
    level.setCharacterPosition(this.dialog.npc, 10, 49);
    leader.tasks.addTask("onPlayerCapture", 1000, 1);
  }

  startCombat() {
    this.dialog.npc.setAsEnemy(game.player);
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
