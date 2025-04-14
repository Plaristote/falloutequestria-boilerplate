import {skillCheck, skillContest} from "../cmap/helpers/checks.mjs";

export class DialogHelper {
  constructor(dialog) {
    const levelScript = typeof level !== "undefined" ? level.script : null;

    this.dialog = dialog;
    if (levelScript && levelScript.ambiance)
      this.dialog.ambiance = level.getScriptObject().ambiance;
    //this.updateMood();
  }

  get npcScript() {
    return this.dialog.npc.getScriptObject();
  }

  firstMeetingCheck() {
    if (this.dialog.npc.getVariable("met", 0) == 0) {
      this.dialog.npc.setVariable("met", 1);
      return true;
    }
    return false;
  }

  getDefaultMood() {
    return "neutral";
  }

  updateMood() {
    if (this.dialog.npc.hasVariable("mood"))
      this.dialog.mood = this.dialog.npc.getVariable("mood");
    else
      this.dialog.mood = this.getDefaultMood();
  }

  setPersistentMood(mood) {
    if (mood === this.getDefaultMood())
      this.dialog.npc.unsetVariable("mood");
    else
      this.dialog.npc.setVariable("mood", mood);
    this.updateMood();
  }
  
  barter() {
    this.dialog.tryToBarter();
  }
}

export class SkillAnswer {
  static create(dialog, name, option) {
    const skill = typeof option == "string" ? option : "speech";
    const instance = new SkillAnswer(dialog, name, skill);
    return function () {
      if (typeof option == "object")
        return instance[option.type || 'check'](option);
      return instance.check();
    };
  }

  static multiple(dialog, name, array) {
    let i = 1;
    array = array.map(entry => {
      let instance;
      if (typeof entry == "string") {
        instance = new SkillAnswer(dialog, `${name}${i++}`, entry);
        instance.run = instance.check.bind(instance);
      } else {
        instance = new SkillAnswer(dialog, `${name}${i++}`, entry.skill);
        instance.run = instance[entry.type || 'check'].bind(instance, entry);
      }
      return instance;
    });
    return function() {
      for (let entry of array) {
        if (entry.passed || entry.run())
          return true;
      }
      return false;
    }
  }

  constructor(dialog, name, skill) {
    this.dialog = dialog;
    this.varname = `skillanswer-${name}`;
    this.skill = skill;
  }

  get passed() {
    return this.dialog.npc.getVariable(this.varname, 0) > 0;
  }

  set passed(value) {
    this.dialog.npc.setVariable(this.varname, value ? 1 : 0);
  }

  check(options = { target: 110 }) {
    if (!this.passed) {
      if (!(skillCheck(game.player, this.skill, options)))
        return false;
      this.passed = true;
    }
    return true;
  }

  contest(options = {}) {
    if (!this.passed) {
      const success = skillContest({
        character: game.player, bonus: options.playerBonus || 0
      }, {
        character: this.dialog.npc, bonus: options.npcBonus || 0
      }, options.skills || this.skill, options.diceType || 100);
      if (!success) return false;
      this.passed = true;
    }
    return true;
  }
}
