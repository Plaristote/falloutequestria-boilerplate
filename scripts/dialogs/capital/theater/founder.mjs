class Dialog {
  constructor(dialog) {
    this.dialog = dialog;
  }

  canCommentOnBook() {
    return game.player.statistics.intelligence >= 8 || game.player.statistics.perks.indexOf("bookworm") >= 0;
  }

  commentedOnBook() {
    return this.dialog.npc.hasVariable("mentionBook");
  }

  commentOnBook() {
    if (!this.dialog.npc.hasVariable("mentionBook")) {
      this.dialog.npc.setVariable("mentionBook", 1);
      game.dataEngine.addReputation("ash-aven", 15);
    }
  }

  canAskAboutOmbrageLab() {
    const mainQuest = game.quests.getQuest("celestialDevice");
    return !mainQuest.isObjectiveCompleted("find-arm-module") && mainQuest.hasVariable("ombrageLabHint") && !this.dialog.npc.hasVariable("openTunnel");
  }

  canLearnAboutSecretTunnel() {
    return game.dataEngine.getReputation("ash-aven") >= 125 || game.player.statistics.speech >= 90 || this.dialog.npc.hasVariable("mentionBook");
  }

  onLabMakePlea() {
    return this.canLearnAboutSecretTunnel() ? "laboratory/secret-tunnel" : "laboratory/dissuasive";
  }

  openSecretTunnel() {
    const shelf = level.findObject("founder-room.shelf");
    shelf.script.moved = true;
    shelf.script.onMoved();
    level.setObjectPosition(shelf, 16, 9, 0);
    this.dialog.npc.setVariable("openTunnel", 1);
  }

  startHolodiskQuest() {
    game.quests.addQuest("capital/founders-holodisk");
  }

  canGiveHolodisk() {
    return game.quests.hasQuest("capital/founders-holodisk") && game.player.inventory.count("quest-holodisk-founder") > 0;
  }

  onHolodiskGiven() {
    const item = game.player.inventory.getItemOfType("quest-holodisk-founder");

    game.dataEngine.addReputation("ash-aven", 25);
    game.quests.getQuest("capital/founders-holodisk").completeObjective("give-holodisk");
    game.player.inventory.removeItem(item);
    this.dialog.npc.inventory.addItem(item);
    if (item.script) // TODO implement this later, the holodisk is now decrypted, and it might be stolen by the player to read its content
      item.script.unlocked = true;
  }

  onHolodiskStoryStart() {
    game.quests.getQuest("capital/founders-holodisk").setVariable("toldStory", 1);
  }

  knowsAboutOmbrageExperiments() {
    return false; // TODO
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
