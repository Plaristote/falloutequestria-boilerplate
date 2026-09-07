import ItemBehaviour from "./../readable-note.mjs";
import {requireQuest, QuestFlags} from "./../../quests/helpers.mjs";

export default class extends ItemBehaviour {
  get noteContent() {
    return i18n.t("quests.cristal-den/investigate-bibin.outpost-note");
  }

  onNoteRead() {
    const quest = requireQuest("cristal-den/investigate-bibin", QuestFlags.HiddenQuest);
    super.onNoteRead();
    quest.script.pushUniqueEvent("read-outpost-note");
  }
}
