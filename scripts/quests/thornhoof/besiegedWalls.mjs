import {QuestHelper} from "../helpers.mjs";

export default class extends QuestHelper {
  initialize() {
    this.model.location = "thornhoof";
    this.model.addObjective("meet-council", this.tr("go-to-council-room"));
  }

  startGroupedQuest() {
    this.model.addObjective("talk-to-beryl", this.tr("talk-to-beryl"));
    this.model.addObjective("talk-to-scribe", this.tr("talk-to-scribe"));
    this.model.addObjective("talk-to-emissary", this.tr("talk-to-emissary"));
    this.model.addObjective("talk-to-leaf", this.tr("talk-to-leaf"));
    this.model.addObjective("talk-to-scroll", this.tr("talk-to-scroll"));
  }
}
