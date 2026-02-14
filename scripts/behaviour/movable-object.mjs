import {skillCheck} from "../cmap/helpers/checks.mjs";

export class MovableObject {
  constructor(model) {
    this.model = model;
    this.destructible = true;
    this.detectionDifficulty = 1;
    this.moveDifficulty = 1;
  }

  get canMove() {
    return this.model.getVariable("moveable") == 1;
  }

  set canMove(value) {
    this.model.setVariable("moveable", value ? 1 : 0);
  }

  get moved() {
    return this.model.getVariable("moved") == 1;
  }

  set moved(value) {
    const oldValue = this.moved;
    this.model.setVariable("moved", value ? 1 : 0);
    if (value && !oldValue) this.onMoved();
  }

  get candidatePositions() {
    return this.model.getAvailableSurroundingCoordinates();
  }

  get targetPosition() {
    for (let position of this.candidatePositions) {
      const occupants = game.level.getDynamicObjectsAt(position.x, position.y, this.model.floor);
      if (occupants.filter(occupant => occupant != this.model).length == 0) { return position; }
    }
    return null;
  }

  getAvailableInteractions() {
    if (this.canMove && !this.moved)
      return ["use", "look", "use-skill"];
    return ["look", "use-skill"];
  }

  onUse(user) {
    const position = this.targetPosition;

    if (position)
      game.asyncAdvanceTime(5, () => { this.onAttemptedToPushAt(user, position); });
    else
      game.appendToConsole(i18n.t("actions.no-room-to-move-object"));
    return true;
  }

  onAttemptedToPushAt(user, position) {
    if (this.tryToMoveMovableObject(user)) {
      this.onSuccessfullPushAt(user, position);
    } else {
      game.appendToConsole(i18n.t("actions.failed-to-move-movable-object"));
    }
  }

  onSuccessfullPushAt(user, position) {
    this.moved = true;
    level.setObjectPosition(this.model, position.x, position.y, this.model.floor);
    game.appendToConsole(i18n.t("actions.moved-moveable-object"));
  }

  onLook(user) {
    let message = "inspection.moveable-object.";

    if (this.moved) {
      message += "moved";
    } else if (!this.canMove && this.tryToDetectMovableObject(user)) {
      message += "found";
      this.canMove = true;
    } else if (this.canMove) {
      message += "look";
    }
    user.lookAt(this.model);
    game.appendToConsole(i18n.t(message, {target: this.model.displayName}));
    return true;
  }

  onUseRepair(user) {
    if (!this.canMove) {
      if (skillCheck(user, "repair", { target: 30 + this.moveDifficulty * 20 })) {
        game.appendToConsole(i18n.t("inspection.movable-object.found"));
        this.canMove = true;
        return true;
      }
    } else if (!this.moved) {
      if (skillCheck(user, "repair", { target: 35 + this.moveDifficulty * 25 })) {
        const position = this.targetPosition;
        if (position)
          game.asyncAdvanceTime(5, () => { this.onSuccessfullPushAt(user, position); });
        else
          game.appendToConsole(i18n.t("actions.no-room-to-move-object"));
        return true;
      }
    }
    return false;
  }

  onMoved() {
  }

  tryToDetectMovableObject(user) {
    if (skillCheck(user, "perception", { dice: 10 - this.detectionDifficulty, target: 11}))
      this.canMove = true;
    return this.canMove;
  }

  tryToMoveMovableObject(user) {
    return skillCheck(user, "strength", { dice: 10 - this.moveDifficulty, target: 11});
  }
}
