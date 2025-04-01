import {requireQuest} from "../../../quests/helpers.mjs";

class Dialog {
  constructor(dialog) {
    this.dialog = dialog;
    this.knowsHowEntityGotHere = false;
    this.canJokeAboutAge = false;
  }

  set calledOut(value)      { this.dialog.npc.setVariable("revealed", value ? 1 : 0); }
  get calledOut()           { return this.dialog.npc.getVariable("revealed") == 1; }
  set freed(value)          { level.setVariable("entityFreed", value ? 1 : 0); }
  get freed()               { return level.getVariable("entityFreed") == 1; }
  set taken(value)          { level.setVariable("entityTaken", value ? 1 : 0); }
  get taken()               { return level.getVariable("entityTaken") == 1; }
  get withBloodPact()       { return level.getVariable("bloodPact") == 1; }
  get promisedDevice()      { return this.dialog.npc.getVariable("promisedDevice") == 1; }
  set promisedDevice(value) { this.dialog.npc.setVariable("promisedDevice", value ? 1 : 0); }

  getEntryPoint() {
    if (this.freed && !this.taken)
      return "take-prompt";
    return this.calledOut ? "alt-entry" : "entry";
  }

  canInspectTerminal() {
    return Math.max(game.player.statistics.science, game.player.statistics.spellcasting) >= 80;
  }

  inspectTerminal() {
    const { science, spellcasting } = game.player.statistics;

    if (science > spellcasting) {
      this.inspectSkill = 'science';
    } else {
      this.inspectSkill = 'spellcasting';
    }
    game.player.statistics.addExperience(75);
  }

  terminalInspected() {
    return { textKey: `find-anomaly-with-${this.inspectSkill}` };
  }

  bigRevealIndex() {
    this.calledOut = true;
    switch (this.dialog.previousAnswer) {
    case "ask-who-is-that":  this.canJokeAboutAge       = true; break ;
    case "ask-how-got-here": this.knowsHowEntityGotHere = true; break ;
    }
    switch (this.dialog.previousAnswer) {
    case "ask-who-is-that":           return { textKey: "who-is-that" };
    case "ask-are-you-alive":         return { textKey: "are-you-alive" };
    case "ask-how-got-here":          return { textKey: "how-got-here" };
    case "ask-about-cult":            return { textKey: "about-cult" };
    case "more-called-out-questions": return { textKey: "on-more-questions" };
    }
  }

  freeEntity() {
    this.freed = true;
    return { textKey: (this.calledOut ? "on-free-entity-called-out" : "on-free-entity-unknowing") }
  }

  takeEntity() {
    this.taken = true;
    game.player.inventory.addItemOfType("dark-magic-artefact");
  }

  destroyEntityIndex() {
    return { textKey: (this.withBloodPact ? "destroy-entity-blood-pact" : "destroy-entity") };
  }

  destroyVat() {
    const vat = level.findObject("floor-3.confinement-room.vat");
    vat.script.onDamaged();
  }

  canDestroyWithMagic() { return game.player.statistics.spellcasting >= 65; }
  canDestroyWithScience() { return game.player.statistics.science >= 75; }

  sarcasmContinue() {
    const mainQuest = requireQuest("celestialDevice");

    if (this.withBloodPact && !mainQuest.isObjectiveCompleted("find-celestial-device-arm")) {
      this.promisedDevice = true;
      return "on-device-help";
    }
    return "on-sarcasm-continue";
  }

  negociateDeviceHelp() { game.player.statistics.addExperience(75); }
  canNegociateDeviceHelp() { return game.player.statistics.speech >= 85; }
  canCallOut() { return game.player.statistics.intelligence > 5 || game.player.statistics.perception > 6; }
}

export function create(dialog) {
  return new Dialog(dialog);
}
