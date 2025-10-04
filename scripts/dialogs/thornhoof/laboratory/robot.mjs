class Dialog {
  constructor(dialog) {
    this.dialog = dialog;
  }

  get isFollowing() {
    return this.dialog.npc.tasks.hasTask("followPlayer");
  }

  startFollow() {
    this.dialog.npc.tasks.addUniqueTask("followPlayer", 1750, 0);
  }

  stopFollow() {
    this.dialog.npc.tasks.removeTask("followPlayer");
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
