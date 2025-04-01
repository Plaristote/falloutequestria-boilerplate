export class EntityVat {
  constructor(model) {
    this.model = model;
    this.dialog = "capital/laboratory/confinement-terminal";
  }

  getAvailableInteractions() {
    return this.canTalk ? ["use", "look"] : ["look"];
  }

  get taken() {
    return level.getVariable("entityTaken") == 1;
  }

  get destroyed() {
    return this.model.getVariable("destroyed") == 1;
  }

  set destroyed(value) {
    this.model.setVariable("destroyed", value ? 1 : 0);
  }

  get canTalk() {
    return !this.destroyed && !this.taken;
  }

  onUse(user) {
    if (user == game.player)
      level.initializeDialog(this.model, this.dialog);
    return true;
  }

  onDamaged() {
    game.player.statistics.addExperience(150);
    this.model.setAnimation("vat-computer-destroyed-right");
    this.destroyed = true;
  }
}
