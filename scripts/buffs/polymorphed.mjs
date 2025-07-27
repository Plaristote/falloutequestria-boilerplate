export class Polymorphed {
  constructor(model) {
    this.model = model;
  }

  get newMorph() {
    return this.model.target.script.polymorphParams;
  }

  get originalForm() {
    return JSON.parse(this.model.getVariable("backup"));
  }

  storePreviousMorph() {
    if (!this.model.hasVariable("backup")) {
      const params = this.newMorph;
      const backup = {};

      Object.keys(params).forEach(key => {
        backup[key] = this.model.target.statistics[key].toString();
      });
      this.model.setVariable("backup", JSON.stringify(backup));
    }
  }

  initialize() {
    this.storePreviousMorph();
    this.withPolymorphAnimation(this.startPolymorph.bind(this));
  }

  finalize() {
    this.withPolymorphAnimation(this.endPolymorph.bind(this));
  }

  withPolymorphAnimation(callback) {
    const queue = this.model.target.actionQueue;
    const position = this.model.target.spritePosition;

    queue.reset();
    queue.pushAnimation([{
      type: "Sprite",
      name: "effects",
      animation: "polymorph-start",
      fromX: position.x + 5, fromY: position.y - 85 / 2
    }]);
    queue.pushScript(callback);
    queue.pushAnimation([{
      type: "Sprite",
      name: "effects",
      animation: "polymorph-end",
      fromX: position.x + 5, fromY: position.y - 85 / 2,
      x: 10000,
      y: 10000
    }]);
    queue.start();
  }

  startPolymorph() {
    this.applyMorph(this.newMorph);
    if (this.originalForm.race !== "changeling") {
      this.model.tasks.addTask("wearOff", 3600000);
    }
  }

  endPolymorph() {
    this.applyMorph(this.originalForm);
  }

  applyMorph(params) {
    Object.keys(params).forEach(key => {
      this.model.target.statistics[key] = params[key];
    });
  }

  wearOff() {
    this.model.remove();
    if (this.model.target === game.player) {
      game.appendToConsole(i18n.t("messages.spell-wear-off", {
        spell: i18n.t("spells.polymorph")
      }));
    }
  }
}
