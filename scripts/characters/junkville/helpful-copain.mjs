import {CharacterBehaviour} from "../character.mjs";

const disappearDelay = 172800;

export class HelpfulCopain extends CharacterBehaviour {
  constructor(model) {
    super(model);
  }

  get dialog() {
    return "junkville/helpful-copain";
  }

  initialize() {
    this.model.tasks.addTask("prepareDisappear", disappearDelay * 1000, 1)
  }

  prepareDisappear() {
    const lastVisit = game.dataEngine.getLevelData("junkville")["lastUpdate"];

    if (game.timeManager.getTimestamp() - lastVisit >= disappearDelay)
      this.model.tasks.addTask("delayedDisappear", 1000, 1);
  }

  delayedDisappear() {
    this.model.setVariable("disappeared", 1);
    this.model.setVariable("disappearedAt", game.timeManager.getTimestamp());
    this.model.setScript("junkville/helpful-copain-disappeared.mjs");
    game.uniqueCharacterStorage.saveCharacterFromCurrentLevel(this.model);
  }
}
