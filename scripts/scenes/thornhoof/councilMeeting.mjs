import {SceneManager} from "../../behaviour/sceneManager.mjs";

export default class CouncilMeeting extends SceneManager {
  constructor(parent) {
    super(parent, "council-meeting");
  }

  get actors() {
    return [
      level.findObject("thornhoof-beryl"),
      level.findObject("thornhoof-leaf"),
      level.findObject("thornhoof-scroll"),
      level.findObject("thornhoof-varka"),
      level.findObject("hoarfrost"),
      level.findObject("silvertide")
    ];
  }

  get states() {
    const array = [];
    for (let i = 1 ; i <= 13 ; ++i)
      array.push(this[`state${i}`].bind(this));
    return array;
  };

  initialize() {
    if (game.uniqueCharacterStorage.loadCharacterToCurrentLevel("thornhoof/silvertide", 37, 8, 0)) {
      level.findObject("silvertide").lookTo(38, 5);
    }
    super.initialize();
  }

  dialogLineStep(options) {
    this.actors.forEach(actor => actor.lookAt(options.speaker));
    return super.dialogLineStep(options);
  }

  state1() {
    return this.dialogLineStep({
      speaker: level.findObject("thornhoof-scroll"),
      line: this.line("#1-scroll"),
      duration: 5,
      towards: { x: 38, y: 5 }
    });
  }

  state2() {
    return this.dialogLineStep({
      speaker: level.findObject("silvertide") || level.findObject("thornhoof-beryl"),
      line: this.line("#2-silvertide"),
      duration: 7,
      target: level.findObject("thornhoof-scroll")
    });
  }

  state3() {
    const target = level.findObject("silvertide") || level.findObject("thornhoof-beryl");
    return this.dialogLineStep({
      speaker: level.findObject("hoarfrost"),
      line: this.line("#3-hoarfrost", { target: target.statistics.name }),
      duration: 7,
      target: target,
      color: "lightgreen"
    });
  }

  state4() {
    return this.dialogLineStep({
      speaker: level.findObject("thornhoof-beryl"),
      line: this.line("#4-beryl"),
      duration: 10,
      target: level.findObject("hoarfrost"),
      color: "beige"
    });
  }

  state5() {
    return this.dialogLineStep({
      speaker: level.findObject("thornhoof-leaf"),
      line: this.line("#5-leaf"),
      duration: 12,
      target: level.findObject("thornhoof-beryl"),
      color: "beige"
    });
  }

  state6() {
    return this.dialogLineStep({
      speaker: level.findObject("thornhoof-varka"),
      line: this.line("#6-varka"),
      duration: 12,
      towards: { x: 36, y: 6},
      color: "lightgreen"
    });
  }

  state7() {
    return this.dialogLineStep({
      speaker: level.findObject("thornhoof-scroll"),
      line: this.line("#7-scroll"),
      duration: 8,
      target: level.findObject("thornhoof-varka")
    });
  }

  state8() {
    return this.dialogLineStep({
      speaker: level.findObject("thornhoof-varka"),
      line: this.line("#8-varka"),
      duration: 9,
      target: level.findObject("thornhoof-scroll"),
      color: "lightgreen"
    });
  }

  state9() {
    return this.dialogLineStep({
      speaker: level.findObject("hoarfrost"),
      line: this.line("#9-hoarfrost"),
      duration: 8,
      target: level.findObject("thornhoof-scroll"),
      color: "beige"
    });
  }

  state10() {
    return this.dialogLineStep({
      speaker: level.findObject("thornhoof-beryl"),
      line: this.line("#10-beryl"),
      duration: 8,
      target: level.findObject("hoarfrost"),
      color: "yellow"
    });
  }

  state11() {
    return this.dialogLineStep({
      speaker: level.findObject("thornhoof-leaf"),
      line: this.line("#11-leaf"),
      duration: 7,
      target: level.findObject("thornhoof-beryl"),
      color: "yellow"
    });
  }

  state12() {
    return this.dialogLineStep({
      speaker: level.findObject("silvertide"),
      line: this.line("#12-silvertide"),
      duration: 5,
      target: level.findObject("thornhoof-leaf"),
      color: "red"
    });
  }

  state13() {
    return this.dialogLineStep({
      speaker: level.findObject("thornhoof-scroll"),
      line: this.line("#13-scroll"),
      duration: 5,
      towards: { x: 38, y: 5 }
    });
  }
}
