import {DialogComponent} from "./dialog.mjs";

class NpcDialogTask {
  constructor(parent) {
    this.parent = parent;
    if (this.parent.hasVariable("NpcDialogTask"))
      this.parts = JSON.parse(this.parent.getVariable("NpcDialogTask"));
    this.setTargetsTaskState(true);
  }
  
  initialize(parts) {
    this.parts = parts;
    this.persistParts();
    this.setTargetsTaskState(true);
  }

  finalize() {
    this.parent.unsetVariable("NpcDialogTask");
    this.setTargetsTaskState(false);
    delete this.parent.npcDialogTask;
  }
  
  persistParts() {
    this.parent.setVariable("NpcDialogTask", JSON.stringify(parts));
  }
  
  setTargetsTaskState(value) {
    this.parts.forEach(part => {
      const character = level.findObject(part.character);
      const script = character.getScriptObject();

      if (value) {
        script._npcDialogTaskCallback = this.triggerCurrentStep.bind(this);
        script._npcDialogTask = true;
      }
      else {
        delete script._npcDialogTaskCallback;
        delete script._npcDialogTask;
      }
    });
  }

  prepareNextStep() {
    const part = this.parts[0];
    const character = level.findObject(part.character);

    character.tasks.addTask(part.delay, "_npcDialogTaskCallback", 1);
  }

  triggerCurrentStep() {
    const part = this.parts[0];
    const character = level.findObject(part.character);

    this.parts = this.parts.splice(1);
    this.persistParts();
    level.addTextBubble(character, part.content, part.duration, part.color);
    this.prepareNextStep();
  }
}

export class NpcDialogComponent extends DialogComponent {
  constructor(model) {
    super(model)
    if (this.model.hasVariable("NpcDialogTask"))
      this.npcDialogTask = new NpcDialogTask(this);
  }

  startNpcDialogTask(parts) {
    this.npcDialogTask = new NpcDialogTask(this);
    this.npcDialogTask.initialize(parts);
  }
  
  isBusy() {
    return this._npcDialogTask === true;
  }
}
