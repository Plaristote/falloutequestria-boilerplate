import {CharacterBehaviour} from "../character.mjs";

export class HelpfulCopain extends CharacterBehaviour {
  constructor(model) {
    super(model);
  }

  get dialog() {
    return "junkville/helpful-copain";
  }

  helpfulDisappear() {
    character.tasks.removeTask("prepareDisappear");
    character.tasks.addUniqueTask("prepareDisappear", helpfulDisappearDelay * 1000, 1);
  }

  prepareDisappear() {
    this.model.tasks.addTask("delayedDisappear", 1000, 1);
  }

  delayedDisappear() {
    this.model.setVariable("disappeared", 1);
    this.model.setVariable("disappearedAt", game.timeManager.getTimestamp());
    this.model.setScript("junkville/helpful-copain-disappeared");
    this.model.script.initialize();
    this.model.isUnique = true;
    game.uniqueCharacterStorage.saveCharacterFromCurrentLevel(this.model);
  }
}
