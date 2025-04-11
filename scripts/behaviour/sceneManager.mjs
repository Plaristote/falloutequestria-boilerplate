import {toggleRoutine} from "./routine.mjs";

export class SceneManager {
  constructor(parent, id) {
    this.parent = parent;
    this.model = parent.model;
    this.id = id;
    if (this.active)
      this.triggerCurrentStep();
  }

  get storageScope() {
    return "scene-" + this.id;
  }

  get active() {
    const current = this.state;
    return current !== null && this.states.length > current;
  }

  get state() {
    return this.model.hasVariable(this.storageScope)
      ? this.model.getVariable(this.storageScope)
      : null;
  }

  set state(value) {
    this.model.setVariable(this.storageScope, value);
  }

  get saveLocked() {
    return this._saveLocked;
  }

  set saveLocked(value) {
    game.saveLock = this._saveLocked = value;
  }

  get actors() {
    return [];
  }

  line(name, options = {}) {
    return i18n.t(`scenes.${this.id}.${name}`, options);
  }

  initialize() {
    this.state = 0;
    this.prepare();
    this.registerSceneManager();
  }

  prepare() {
    const self = this;
    this.actors.forEach(actor => {
      if (actor) {
        toggleRoutine(actor, false);
        if (actor.script)
          actor.script.sceneManager = self;
        else
          console.log("Invalid script on scene actor", actor.displayName);
        actor.actionQueue.reset();
      }
      else
        console.log("Scene", this.id, "has invalid an actor.");
    });
    this.triggerCurrentStep();
  }

  finalize() {
    if (this.saveLocked)
      this.saveLocked = false;
    this.actors.forEach(actor => {
      toggleRoutine(actor, true);
    });
    this.model.unsetVariable(this.storageScope);
    this.unregisterSceneManager();
    this.state = null;
  }

  registerSceneManager() {
    const script = level.getScriptObject();

    if (script && script.appendSceneManager)
      script.appendSceneManager(this);
  }
  
  unregisterSceneManager() {
    const script = level.getScriptObject();

    if (script && script.removeSceneManager)
      script.removeSceneManager(this);
  }

  triggerNextStep(continuing = true) {
    if (!continuing)
      return ;
    if (this.active) {
      this.state++;
      this.triggerCurrentStep(continuing);
    }
  }

  triggerCurrentStep(continuing = true) {
    if (this.states.length > this.state)
      this.states[this.state](continuing);
    else
      this.finalize();
  }

  dialogLineStep(options) {
    const actions = options.speaker.actionQueue;
    const bubbleDuration = (options.bubbleDuration * 1000) || (options.duration * 1300);
    const color = options.color || "white";

    if (options.speaker.unconscious) {
      options.fallback ? options.fallback() : this.triggerNextStep();
    } else {
      if (options.target)
        actions.pushLookAt(options.target);
      else if (options.towards)
        actions.pushLookAt(options.towards.x, options.towards.y);
      actions.pushSpeak(options.line, bubbleDuration, color);
      actions.pushWait(options.duration);
      actions.pushScript(this.triggerNextStep.bind(this));
      actions.start();
    }
  }

  openPromptStep(title, options) {
    const sceneOptions = JSON.parse(JSON.stringify(options));
    const callback = function (index) {
      try {
        options[index].callback();
      } catch (err) {
        console.log("SceneManager::openPromptStep: prompt callback crashed:", err);
      }
      this.triggerNextStep();
    };

    for (let i = 0 ; i < options.length ; ++i)
      sceneOptions[i].callback = callback.bind(this, i);
    game.openPrompt(title, sceneOptions);
  }

  onCombatTurn(character) {
  }
  
  onActionQueueCompleted(character) {
  }

  onDied(character) {
  }

  onDamageTaken(character) {
  }

  onSceneTick() {
  }

  onLevelExit() {
    this.finalize();
  }
}
