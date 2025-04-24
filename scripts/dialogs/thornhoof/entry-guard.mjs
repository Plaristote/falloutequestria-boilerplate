import {DialogHelper} from "../helpers.mjs";

export default class extends DialogHelper {
  onIntroduction() {
    this.npcScript.metPlayer = true;
    switch (this.dialog.lastAnswer) {
      case "ask-for-no-trouble": return { textKey: "about-trouble" };
      case "ask-about-silvertide": return { textKey: "about-silvertide" };
      case "ask-about-town": return { textKey: "about-town" };
      case "ask-whats-happening": return { textKey: "whats-happening" };
    }
  }

  onRunAway() {
    this.dialog.npc.setAsEnemy(game.player);
  }

  onGoToMeeting() {
    game.asyncAdvanceTime(3, () => {
      level.insertPartyIntoZone(game.playerParty, "silvertide-meeting");
      level.cameraFocusRequired(game.player);
    });
  }
}
