import {BarkeepHelper} from "../barkeep.mjs";

class Dialog extends BarkeepHelper {
  constructor(dialog) {
    super(dialog, [
      { name: "beer",        price: 3, onDrink: "drunk" },
      { name: "whiskey",     price: 5, onDrink: "drunk" },
      { name: "sparkleCola", price: 8 }
    ]);
  }

  get knownName() {
    if (this.dialog.npc.hasVariable("knownsName"))
      return this.dialog.player.statistics.name;
    return i18n.t("common.stranger");
  }

  canAskAboutSheriffMurder() {
    const quest = game.quests.getQuest("hillburrow/oldSheriffMurder");
    return quest && quest.hasVariable("knowsBarHabits");
  }

  toldAboutMercenariesInvolvementInSheriffMurder() {
    const quest = game.quests.getQuest("hillburrow/oldSheriffMurder");
    quest.setVariable("leadsMercenaries", 1);
    quest.setVariable("leadsSheriffWorkingCase", 1);
    quest.script.pushEvent("barkeepToldAboutMercenary");
  }

  toldAboutDrunkenMasterDisputeWithSheriff() {
    const quest = game.quests.getQuest("hillburrow/oldSheriffMurder");
    quest.setVariable("leadsDrunkenMaster", 1);
    quest.script.pushEvent("barkeepToldAboutDrunkenMaster");
  }

  onToldName() {
    this.dialog.npc.setVariable("knownsName", 1);
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
