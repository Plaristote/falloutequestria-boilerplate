import {LevelBase} from "./base.mjs";
import {SceneManager} from "../behaviour/sceneManager.mjs";
import * as Polymorph from "../spells/polymorph.mjs";
import {requireQuest} from "../quests/helpers.mjs";

class Scene extends SceneManager {
  get victim() {
    return level.findObject("victim");
  }

  get changeling() {
    return level.findObject("changeling");
  }

  get states() {
    return [
      this.victimLine.bind(this),
      this.takeAppearence.bind(this),
      this.performMurder.bind(this)
    ];
  }

  victimLine() {
    const actions = this.victim.actionQueue;
    actions.pushSpeak(i18n.t("dialogs.unhaus/ovipostor.scene-victim-line"), 3500);
    actions.pushWait(2);
    actions.pushScript(this.triggerNextStep.bind(this));
    actions.start();
  }

  takeAppearence() {
    const actions = this.changeling.actionQueue;
    actions.pushSpeak(i18n.t("dialogs.unhaus/ovipostor.scene-line"), 5000);
    actions.pushWait(1);
    actions.pushScript(() => {
      this.changeling.script.changelingImitate(this.victim);
      this.triggerNextStep();
    });
    actions.start();
  }

  performMurder() {
    const actions = this.changeling.actionQueue;
    actions.pushWait(1);
    actions.pushAnimation("use");
    actions.pushWait(1);
    actions.pushScript(() => {
      this.victim.takeDamage(this.victim.statistics.hitPoints, this.changeling);
    });
    actions.pushWait(2);
    actions.pushLookAt(game.player);
    actions.pushScript(this.triggerNextStep.bind(this));
    actions.start();
  }

  finalize() {
    super.finalize();
    this.changeling.isUnique = true;
    this.changeling.tasks.addUniqueTask("encounterDisposeBody", 1200, 1);
    this.changeling.script.startDialog();
  }
}

export default class extends LevelBase {
  initialize() {
    requireQuest("changelingQuest");
  }

  onLoaded() {
    this.scene = new Scene(this, "ovipostor-meeting");
    this.scene.changeling.statistics.faction = "";
    this.scene.changeling.setVariable("metInEncounter", 1);
    if (!level.hasVariable("prepared")) {
      level.setVariable("prepared", 1);
      this.scene.changeling.inventory.addItemOfType("ovipostor-todo-list");
      this.scene.initialize();
    }
  }
}
