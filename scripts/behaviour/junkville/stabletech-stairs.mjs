import {getRathian} from "../../characters/rathian/template.mjs";

export class StabletechStairs {
  constructor(model) {
    this.model = model;
  }

  getAvailableInteractions() {
    return ["use", "look"];
  }

  onUse() {
    console.log(level.name, "coucou");
    switch (level.name) {
      case "junkville-stabletech-facility":
        this.goUpstairs();
        break ;
      case "junkville-dumps":
        this.goDownstairs();
        break ;
    }
  }

  goUpstairs() {
    const rathian = getRathian();

    if (rathian)
      rathian.getScriptObject().onPlayerGoesUpstairs();
    game.switchToLevel("junkville-dumps", "from-facility");
  }

  goDownstairs() {
    const rathian = getRathian();

    if (rathian)
      rathian.getScriptObject().onPlayerGoesDownstairs();
    game.switchToLevel("junkville-stabletech-facility");
  }
}
