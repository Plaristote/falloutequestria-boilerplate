import Terminal from "../../terminal.mjs";

export default class extends Terminal {
  constructor(model) {
    super(model);
    this.hackable = false;
    this.dialog = "thornhoof/laboratory/laboratory-terminal";
  }

  get enabled() {
    return level.script.powerEnabled;
  }

  get sprite() {
    return "wall-terminal-right";
  }

  onEnabledChanged() {
    this.model.setAnimation(`${this.sprite}${this.enabled ? '' : '-sleep'}`);
  }

  onUseItem(character, item) {
    console.log("DOUTAGE: onUseItem", character, item);
    if (character == game.player &&
        item.itemType == "thornhoof-lab-quest-holodisk") {
      level.initializeDialog(this.model, this.dialog, "scroll-logs/holodisk-entry");
      return true;
    }
  }

  getAvailableInteractions() {
    return ["use", "look", "use-object", "use-skill"];
  }
}
