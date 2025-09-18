import {DialogHelper} from "../helpers.mjs";
import {drunkenQuestSucceeded} from "../../quests/hillburrow/saveDrunkenMaster.mjs";
import {hasActiveOldSheriffMurderQuest} from "../../quests/hillburrow/oldSheriffMurder.mjs";

class Dialog extends DialogHelper {
  constructor(dialog) {
    super(dialog);
    this.firstEntry = true;
  }

  entryLine() {
    if (!this.dialog.npc.hasVariable("firstDialog")) {
      this.dialog.npc.setVariable("firstDialog", 1);
      if (!drunkenQuestSucceeded()) {
        this.dialog.mood = "angry";
        return this.dialog.t("entry-drunken-quest-failed");
      }
      this.dialog.mood = "smile";
      return this.dialog.t("entry-drunken-quest-success");
    }
    if (this.firstEntry) {
      this.firstEntry = false;
      return this.dialog.t("entry");
    }
    return this.dialog.t("entry-alt");
  }

  canTalkAboutOldSheriffMurder() {
    return hasActiveOldSheriffMurderQuest();
  }

  onTalkAboutOldSheriffMurder() {
    const quest = game.quests.get("hillburrow/oldSheriffMurder");

    quest.completeObjective("talkToDoctor");
  }

  suspicionsAboutOldSheriffMurder() {
    var suffix;
    const quest = game.quests.getQuest("hillburrow/oldSheriffMurder");

    quest.script.pushEvent("doctorsAdvice");
    quest.setVariable("leadsMercenaries", 1);
    if (drunkenQuestSucceeded()) {
      quest.setVariable("leadsDrunken", 1);
      quest.script.pushEvent("doctorsLeadsWithDrunken");
      suffix = this.dialog.t("old-sheriff-with-drunken");
    }
    else {
      quest.script.pushEvent("doctorsLeadsWithoutDrunken");
      suffix = this.dialog.t("old-sheriff-without-drunken");
    }
    return this.dialog.t("old-sheriff-suspicions") + ' ' + suffix;
  }

  hasArmorBidAilments() {
    return game.player.statistics.perks.indexOf("armorBidAilments") >= 0
        || game.player.statistics.buffs.indexOf("armor-bid-treatment") >= 0;
  }

  cureArmorBidAilments() {
    const buff = game.player.getBuff("armor-bid-treatment");
    if (buff) buff.remove();
    game.player.statistics.togglePerk("armorBidAilments", false);
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
