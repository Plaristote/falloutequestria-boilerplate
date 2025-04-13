export class MovementComponent {
  constructor(model) {
    this.model = model;
  }

  onMovementStart() {
    if (this.model.movementMode === "running")
      this.model.toggleSneaking(false);
  }

  onMovementEnded() {
  }

  followCharacter(character, distance = 3) {
    if (typeof level !== "undefined" && !level.combat) {
      const actions = this.model.actionQueue;

      this.model.movementMode = "running";
      actions.reset();
      actions.pushReach(character, distance);
      actions.start();
    }
  }

  followPlayer(distance = 3) {
    if (typeof level !== "undefined")
      this.followCharacter(level.player, distance);
  }
}
