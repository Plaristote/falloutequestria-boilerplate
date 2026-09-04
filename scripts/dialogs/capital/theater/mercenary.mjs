class Dialog {
  constructor(dialog) {
    this.dialog = dialog;
  }

  canClaimShadowKnightsFell() {
    const quest = game.getQuest("cristal-den/ghoulExpedition");
    return quest && quest.completed;
  }

  toldAboutFellShadowNight() {
    game.dataEngine.addReputation("ash-aven", 15);
  }

  canAskAboutWeaponSkills() {
    return game.player.statistics.smallGuns > 80 || game.player.statistics.bigGuns > 80 || game.player.statistics.energyGuns > 80;
  }

  canBuyDrink() {
    return game.player.inventory.count("bottlecaps") > 10;
  }

  buyDrink() {
    [game.player, this.dialog.npc].forEach(character => character.addBuff("drunk"));;
    game.dataEngine.addReputation("ash-haven", 1);
    game.player.inventory.remoteItemOfType("bottlecaps", 10);
    level.findObject("barmaid").inventory.addItemOfType("bottlecaps", 10);
  }

  canAskMercenaryName() {
    return !this.dialog.npc.hasVariable("toldMercenaryName");
  }

  onAskMercenaryName() {
    this.dialog.npc.setVariable("toldMercenaryName", 1);
  }

  tellAboutMercenaryPast() {
    this.dialog.npc.setVariable("toldMercenaryPast", 1);
  }

  canAskToJoin() {
    return this.dialog.npc.hasVariable("toldMercenaryPast");
  }

  askToJoin() {
    if (game.dataEngine.getReputation("ash-aven") > 50)
      return "mercenary-job/lack-reputation";
    return "mercenary-job/intro";
  }

  get mercenaryFullPrice() {
    return 5000;
  }

  get mercenaryLowerPrice() {
    return game.player.statistics.barter >= 75 ? 3000 : 1000;
  }

  canPayMercenaryFullPrice() {
    return game.player.inventory.count("bottlecaps") >= this.mercenaryFullPrice;
  }

  payMercenaryFullPrice() {
    game.player.inventory.removeItemOfType("bottlecaps", this.mercenaryFullPrice);
  }

  canNegotiateMercenaryPrice() {
    return game.player.inventory.count("bottlecaps") >= this.mercenaryLowerPrice;
  }

  negotiateMercenaryPrice() {
    if (game.player.statistics.barter >= 75) {
      game.player.inventory.removeItemOfType("bottlecaps", this.mercenaryLowerPrice);
      return "mercenary-job/negotiate-accept";
    }
    return "mercenary-job/negotiate-refuse";
  }

  canConvinceMercenaryForFree() {
    return game.player.statistics.speech >= 82;
  }

  startMercenaryCompanionship() {
    level.addTextBubble(this.dialog.npc, this.dialog.t("on-start-companionship"), 3500, "green");
    this.dialog.npc.setScript("companions/mercenary.mjs");
    this.dialog.npc.script.startCompanionship();
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
