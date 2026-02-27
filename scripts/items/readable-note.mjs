import {ItemBehaviour} from "./item.mjs";

export default class extends ItemBehaviour {
  getDescription() {
    if (this.user === game.player) {
      if (this.model.getVariable("read", 0) == 0)
        this.onNoteRead();
      return i18n.t("item-descriptions.note-readable", { content: this.noteContent });
    }
    return i18n.t("item-descriptions.note");
  }

  onNoteRead() {
    this.model.setVariable("read", 1);
  }
}
