function initializePlayerInventory() {
  game.player.inventory.addItemOfType("stable-suit", 1);
  game.player.inventory.addItemOfType("health-potion", 2);
  game.player.inventory.equipItem(game.player.inventory.items[0], "armor");
}

export function initialize() {
  game.appendToConsole(i18n.t("controls.hint"));
  worldmap.setPosition(950, 320);
  worldmap.revealCity("stable-103");
  initializePlayerInventory();

  game.quests.addQuest("celestialDevice");
  game.tasks.addTask("enableEncounters", 25280000, 1);
  game.onCityEnteredAt("stable-entrance", "from-stable");

  //game.onCityEnteredAt("city-sample", "");
  //game.transitionRequired("intro-lyra-animation.mp4", 10);

  //game.player.addBuff("bleeding");
}
