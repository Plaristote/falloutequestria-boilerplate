import {CharacterBehaviour} from "./character.mjs";

const combatBubbles = {
  confident: [
    { content: "Was that supposed to hurt ?", duration: 2000, color: "pink" },
    { content: "Ow ! You'll pay for that !", duration: 2000, color: "red" },
    { content: "Oh, I'm going to enjoy what comes next !", duration: 2500, color: "red" }
  ],
  afraid: [
    { content: "Ow... wait, is that my blood ?", duration: 2000, color: "yellow" },
    { content: "Arg ! Stop it !", duration: 1500, color: "yellow" },
    { content: "I'm not gonna let you kill me so easily", duration: 2500, color: "red" }
  ]
};

class MyLittleCharacter extends CharacterBehaviour {
  constructor(model) {
    super(model);
    this.dialog = "parley";
    if (!model.hasVariable("patrol"))
    {
      model.setVariable("patrol", true);
      model.tasks.addTask("patrolTask", 5000, 0);
    }
  }

  onDamageTaken() {
    const shouldUseALine = (Math.random() * 100) > 60;

    if (shouldUseALine) {
      const mood   = this.model.statistics.hitPoints > 15 ? 'confident' : 'afraid';
      const it     = Math.floor(Math.random() * combatBubbles[mood].length);
      const bubble = combatBubbles[mood][it];

      level.addTextBubble(this.model, bubble.content, bubble.duration, bubble.color || "white");
    }
  }

  patrolTask(count) {
    console.log("Patrol task:", count);
    if (this.model.isAlive()) {
      const actions = this.model.actionQueue;

      if (actions.isEmpty() && !level.isInCombat(this.model))
      {
        const mapSize = level.grid.getSize();
        const x = Math.floor(Math.random() * mapSize.width);
        const y = Math.floor(Math.random() * mapSize.height);

        actions.pushMovement(x, y);
        actions.start();
      }
    }
  }
}

export function create(model) {
  return new MyLittleCharacter(model);
}
