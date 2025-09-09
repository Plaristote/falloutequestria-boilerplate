function initializePlayerInventory() {
  const proficiencies = game.player.statistics.proficiencies;

  game.player.inventory.addItemOfType("stable-suit", 1);
  game.player.inventory.addItemOfType("health-potion", 2);
  game.player.inventory.equipItem(game.player.inventory.items[0], "armor");
  if (proficiencies.indexOf("smallGuns") >= 0) {
    game.player.inventory.addItemOfType("mouthgun");
    game.player.inventory.addItemOfType("9mm-ammo", 20);
  } else {
    game.player.inventory.addItemOfType("combat-knife");
  }
  if (proficiencies.indexOf("lockpick") >= 0) {
    // TODO add lockpick-kit
  }
  if (proficiencies.indexOf("medicine") >= 0) {
    game.player.inventory.addItemOfType("health-potion", 1);
  }
  if (proficiencies.indexOf("speech") >= 0) {
    game.player.inventory.addItemOfType("mint-als");
  }
}

export function initialize() {
  game.appendToConsole(i18n.t("controls.hint"));
  worldmap.setPosition(950, 320);
  worldmap.revealCity("stable-103");
  initializePlayerInventory();

  game.setVariable("startedAt", game.timeManager.getTimestamp());
  game.quests.addQuest("celestialDevice");
  game.tasks.addTask("enableEncounters", 25280000, 1);
  game.onCityEnteredAt("stable-entrance", "from-stable");

  //game.onCityEnteredAt("city-sample", "");
  //game.transitionRequired("intro-lyra-animation.mp4", 10);

  //game.player.addBuff("bleeding");
}
