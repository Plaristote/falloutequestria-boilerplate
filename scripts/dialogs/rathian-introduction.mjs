import DialogHelper from "./companion.mjs";
import RathianJunkvilleDialog from "./rathian-junkville.mjs";

class Dialog extends DialogHelper {
  constructor(dialog) {
    super(dialog);
    this.introduced = !this.firstMeetingCheck();
  }

  getEntryPoint() {
    console.log("Rathian Introduction dialog starting", game.playerParty.containsCharacter(this.dialog.npc));
    if (game.playerParty.containsCharacter(this.dialog.npc))
      return super.getEntryPoint();
    if (this.introduced)
      return "accompany";
    return "introduction";
  }

  get customMenuAnswers() {
    return [this.junkvilleQuestion, this.steelRangerQuestion, this.celestialDeviceQuestion];
  }

  get junkvilleQuestion() {
    return {
      symbol: "junkville-question",
      text: "ask-about-junkville",
      state: "about-junkville"
    }
  }

  get steelRangerQuestion() {
    return {
      symbol: "steel-ranger-question",
      textHook: () => i18n.t("dialogs.rathian-junkville.ask-steel-ranger"),
      hook: () => {
        (new RathianJunkvilleDialog(this.dialog)).toldAboutSteelRangers();
        return {
          text: i18n.t("dialogs.rathian-junkville.about-steel-rangers"),
          mood: "smile",
          answers: [this.backToMenuAnswer]
        };
      }
    };
  }

  get celestialDeviceQuestion() {
    return {
      symbol: "celestial-device-question",
      text: "ask-celestial-device",
      hook: () => {
        this.onTalkedAboutDevice();
        return {
          text: this.dialog.tr("device-answer"),
          answers: [this.backToMenuAnswer]
        }
      }
    };
  }

  get combatEval() {
    const killCount =
      game.player.statistics.getKillCount("earth-pony") +
      game.player.statistics.getKillCount("unicorn");
    return this.dialog.t(`combat-eval-${killCount > 1 ? "good" : "bad"}`);
  }

  onJoinParty() {
    this.onJunkvilleDisclosed();
    level.script.rathianJoinsPlayer();
    this.dialog.npc.script.startFollowingPlayer();
  }

  accompany() {
    if (this.introduced)
      return { textKey: "accompany-again" };
    return { textKey: "accompany" };
  }

  onJunkvilleDisclosed() {
    worldmap.revealCity("junkville");
  }

  onStableDisclosed() {
    game.setVariable("rathian-knows-stable-location", true);
  }
  
  onTalkedAboutDevice() {
    this.dialog.npc.setVariable("talked-about-device", true);
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
