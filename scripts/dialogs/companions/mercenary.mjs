class Dialog {
  constructor(dialog) {
    this.dialog = dialog;
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}