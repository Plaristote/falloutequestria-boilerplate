import CharacterBehaviour from "./../changeling.mjs";
import goToLevelExit from "./../components/pathfinding/goToLevelExit.mjs";

function makeVanishAnimation(target) {
  const position = target.spritePosition;
  return {
    type: "Sprite", name: "effects",
    animation: "polymorph-end",
    fromX: position.x + 5, fromY: position.y - 85 / 2,
    x: 10000, y: 10000
  };
}

export default class extends CharacterBehaviour {
  constructor(model) {
    super(model);
    this.dialog = "unhaus/ovipostor";
  }

  encounterDisposeBody() {
    console.log("encounterDisposeBody called on map", level.name);
    if (level.name == "ovipostor-meeting") {
      console.log("Sure why not");
      const reschedule = () => { this.model.tasks.addUniqueTask("encounterDisposeBody", 1500, 1) };

      if (level.isInCombat(this.model)) {
        reschedule();
      } else {
        const actions = this.model.actionQueue;
        actions.pushReach(level.script.scene.victim);
        actions.pushScript({
          onTrigger: () => {
            level.addAnimationSequence({ steps: [makeVanishAnimation(level.script.scene.victim)] });
            level.deleteObject(level.script.scene.victim);
            this.encounterExit();
          },
          onCancel: reschedule.bind(this)
        });
        actions.start();
      }
    }
  }

  encounterExit() {
    if (level.name == "ovipostor-meeting") {
      const reschedule = () => { this.model.addUniqueTask("encounterExit", 1500, 1); };

      if (!level.isInCombat(this.model))
        goToLevelExit(this.model, reschedule.bind(this));
      else
        reschedule();
    }
  }
}
