import {CharacterBehaviour} from "../character.mjs";
import {helpfulDisappearDelay} from "../../quests/junkville/findHelpful.mjs";

export class HelpfulCopain extends CharacterBehaviour {
  constructor(model) {
    super(model);
  }

  get dialog() {
    if (this.model.hasVariable("insulted") && !this.alreadySaved)
      return null;
    return "junkville/helpful-copain";
  }

  get textBubbles() {
    if (this.model.hasVariable("insulted") && !this.alreadySaved)
      return [{ content: "Bleh", duration: 1500, color: "yellow" }];
    return [{ content: i18n.t("dialogs.junkville/helpful-copain.entry-alt"), duration: 2500 }];
  }

  get alreadySaved() {
    return game.quests.getQuest("junkville/findHelpful")?.completed;
  }

  helpfulDisappear() {
    this.model.tasks.removeTask("prepareDisappear");
    this.model.tasks.addUniqueTask("prepareDisappear", helpfulDisappearDelay * 1000, 1);
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
