import {DialogHelper} from "../helpers.mjs";

class Dialog extends DialogHelper {
  constructor(dialog) {
    super(dialog);
    game.loadingScreenBackground = "helpful_copain";
  }

  get findHelpfulQuest() {
    return game.quests.getQuest("junkville/findHelpful");
  }

  getEntryPoint() {
    this.dialog.mood = "smile";
    if (this.firstMeetingCheck())
      return "entry";
    if (this.findHelpfulQuest?.completed && !this.dialog.npc.hasVariable("savedTalk"))
      this.dialog.npc.setVariable("introduced", 1);
    else if (!this.dialog.npc.hasVariable("introduced"))
      return "introducing";
    return "entry-alt";
  }

  lowerReputation() {
    this.dialog.npc.setVariable("insulted", 1);
    game.dataEngine.addReputation("junkville", -9);
  }

  joinPlayer() {
    this.dialog.npc.setScript("companions/helpful-copain.mjs");
    game.playerParty.addCharacter(this.dialog.npc);
  }

  nameGiven() {
    this.dialog.npc.setVariable("nameGiven", 1);
  }

  onIntroducing() {
    this.dialog.npc.setVariable("introduced", 1);
  }

  onEntryAlt() {
    if (this.findHelpfulQuest?.completed && !this.dialog.npc.hasVariable("savedTalk", 1)) {
      this.dialog.npc.setVariable("savedTalk", 1);
      return { textKey: "after-saved-talk" };
    }
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
