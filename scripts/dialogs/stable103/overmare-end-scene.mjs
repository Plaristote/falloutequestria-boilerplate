import {DealWithRathian} from "../../characters/rathian/flags.mjs";

class Dialog {
  constructor(dialog) {
    this.dialog = dialog;
    this.trust = game.dataEngine.getReputation("stable-103") >= 250 ? 1 : 0;
    this.talkedAboutSeclusion = false;
    level.setVariable("endGameOnExit", 1);
  }

  get rathian() {
    return game.getCharacter("rathian");
  }

  get rathianQuest() {
    return game.quests.getQuest("stable-103/rathian");
  }

  get knewRathianBeforehoof() {
    return !this.rathianQuest.hasVariable("metRathianAsCaptive");
  }

  get useDialogBaseEntry() {
    return !this.rathian.isAlive();
  }

  get useDialogAltEntry() {
    return !this.useDialogBaseEntry;
  }

  get hasMagicalImprint() {
    return true; // TODO
  }

  getEntryPoint() {
    if (this.useDialogAltEntry)
      return "entry/base-alt";
    return "entry/base";
  }

  refusedToKill() {
    let text = this.dialog.tr("entry/refused-to-kill");
    if (game.hasVariable("rathianBetrayedAtStable"))
      text = this.dialog.tr("entry/rathian-captured") + text;
    else
      text = this.dialog.tr("entry/rathian-free") + text;
    return text;
  }

  aboutRathianDiscovery() {
    if (game.hasVariable("rathianBetrayedAtStable"))
      return this.dialog.tr("entry/about-rathian-captivity");
  }

  onTakingPipbuck() {
    let text = this.dialog.tr("entry/taking-pipbuck");

    if (this.dialog.previousAnswer == "accept-to-give-pipbuck") {
      text = this.dialog.tr("entry/authorzed-pipbuck") + text;
      this.increaseTrust();
    }
    return text;
  }

  onSeclusion() {
    this.talkedAboutSeclusion = true;
  }

  onMurderFraming() {
    this.gunPulled = true;
  }

  knowsAboutSentinel() {
    return this.rathianQuest.hasVariable("knowsAboutSentinel");
  }

  canRetortSeclusionRepair() {
    return game.player.statistics.repair >= 80
        || game.player.statistics.science >= 100;
  }

  canRetortSeclusionSpeech() {
    return game.player.statistics.speech >= 100;
  }

  seclusionAskHow() {
    if (this.gunPulled)
      return "safety-concern/murder-framing";
    return "safety-concern/banishment#2";
  }

  canConvincePsychology() {
    return game.player.statistics.medicine >= 80;
  }

  canConvinceLowerSpeech() {
    return game.player.statistics.speech >= 75;
  }

  canConvinceSpeech() {
    return game.player.statistics.speech >= 100;
  }

  canConvinceOfAlliances() {
    const factions = ["diamond-dogs", "junkville", "thornhoof", "ash-aven", "cristal-den", "steel-rangers", "unhaus"];
    let friends = 0;
    factions.forEach(faction => {
      const reputation = game.dataEngine.getReputation(faction);
      if (reputation >= 50)
        friends++;
      else if (reputation <= -50)
        friends--;
    });
    return friends >= (factions.length / 2);
  }

  tryToConvinceToughness() {
    if (this.trust >= 2)
      return "safety-concern/arguing#2";
    return "safety-concern/arguing-lack-trust";
  }

  tryToConvinceAlliance() {
    if (this.trust >= 1)
      return "safety-concern/arguing#2";
    return "safety-concern/arguing-lack-trust";
  }

  tryToConvinceFriendship() {
    if (this.trust >= 2)
      return "safety-concern/arguing-success";
    return "safety-concern/arguing-lack-trust";
  }

  onSentinelConvincedOvermare() {
    game.setVariable("sentinelActivated", "overmare");
  }

  onSentinelConvincedPlayer() {
    game.setVariable("sentinelActivated", "player");
  }

  startFight() {
    level.addTextBubble(this.dialog.npc, this.dialog.tr("call-guards"), 4500, "yellow");
    level.script.startFight();
  }

  endGameOnStableOpening() {
    // TODO implement end game
    game.gameFinished();
  }

  increaseTrust() {
    this.trust++;
  }

  decreaseTrust() {
    this.trust--;
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
