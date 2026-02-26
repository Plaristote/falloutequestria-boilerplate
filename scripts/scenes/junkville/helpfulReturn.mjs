import {SceneManager} from "../../behaviour/sceneManager.mjs";
import {requireQuest} from "../../quests/helpers.mjs";

export class HelpfulReturnScene extends SceneManager {
  constructor(parent) {
    super(parent, "helpful-return");
  }

  get mom() { return game.getCharacter("junkville-copain-mom"); }
  get dad() { return game.getCharacter("junkville-copain-dad"); }
  get son() { return game.getCharacter("helpful-copain"); }

  get actors() {
    return [this.mom, this.dad, this.son];
  }

  get states() {
    return [
      this.dialog1.bind(this),
      this.sonReachesMother.bind(this),
      this.dialog2.bind(this),
      this.dialog3.bind(this),
      this.dialog4.bind(this),
      this.dialog5.bind(this),
      this.finalize.bind(this)
    ];
  }

  dialog1() {
    return this.dialogLineStep({
      speaker: this.mom, target: this.son,
      line: this.line("mom#1"),
      duration: 4.321
    });
  }

  dialog2() {
    return this.dialogLineStep({
      speaker: this.son, target: this.mom,
      line: this.line("son#1"),
      duration: 5.432
    });
  }

  dialog3() {
    return this.dialogLineStep({
      speaker: this.mom, target: this.son,
      line: this.line("mom#2"),
      duration: 5.432
    });
  }

  dialog4() {
    return this.dialogLineStep({
      speaker: this.son, target: this.mom,
      line: this.line("son#2"),
      duration: 5.432
    });
  }

  dialog5() {
    return this.dialogLineStep({
      speaker: this.mom, target: this.son,
      line: this.line("mom#3"),
      duration: 7.654
    });
  }

  sonReachesMother() {
    const actionQueue = this.son.actionQueue;
    this.son.isUnique = false;
    this.son.tasks.removeTask("followPlayer");
    game.playerParty.removeCharacter(this.son);
    actionQueue.pushReach(this.mom, 2);
    actionQueue.pushScript(this.triggerNextStep.bind(this));
    actionQueue.start();
  }

  finalize() {
    super.finalize();
    requireQuest("junkville/findHelpful").completeObjective("save-helpful");
    this.son.setScript("junkville/helpful-copain.mjs");
  }
}
