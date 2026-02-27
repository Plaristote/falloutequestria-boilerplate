import ItemBehaviour from "./../readable-note.mjs";
import {requireQuest} from "./../../quests/helpers.mjs";

export default class extends ItemBehaviour {
  get noteContent() {
    return i18n.t("quests.changelingQuest.ovipostor-note");
  }

  onNoteRead() {
    let quest = game.quests.getQuest("changelingQuest");
    const revealsChangeling = quest == null;

    super.onNoteRead();
    if (revealsChangeling) {
      quest = game.quests.createQuest("changelingQuest");
      quest.setVariable("foundOvipostorNote", 1);
    } else if (!quest.hasVariable("heardAboutUnhaus")) {
      quest.setVariable("heardAboutUnhaus", "ovipostor-note");
    }
    quest.location = "unhaus";
  }
}
