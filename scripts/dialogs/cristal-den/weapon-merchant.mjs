class Dialog {
  constructor(dialog) {
    this.dialog = dialog;
    console.log("BEFORE initializeBarterController");
    this.shop.script.initializeBarterController(this.dialog.barter);
    console.log("AFTER initializeBarterController");
  }

  get shop() {
    return this.dialog.npc.script.shop;
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
