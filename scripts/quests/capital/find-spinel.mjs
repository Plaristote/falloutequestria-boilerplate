import {QuestHelper, QuestFlags} from "../helpers.mjs";

export default class FindSpinel extends QuestHelper {
  constructor(model) {
    super(model);
  }

  get xpReward() {
    return 2000;
  }

  initialize() {
    this.model.location = "capital";
    this.model.addObjective("find-spinel", this.tr("find-spinel"));
    if (game.player.inventory.count("electromagic-spinel") > 0)
      this.model.completeObjective("find-spinel");
    this.model.addObjective("give-spinel", this.tr("give-spinel"));
  }

  getDescription() {
    let text = this.model.tr("description");
    if (this.steelRangersHint)
      text += "<br><br>" + this.model.tr("description-steel-ranger-hint");
    return text;
  }

  get steelRangersHint() { return this.model.hasVariable("srHint"); }
  set steelRangersHint(v) { this.model.setVariable("srHint", v ? 1 : 0); }

  onItemPicked(item) {
    if (item.itemType === "electromagic-spinel")
      this.model.completeObjective("find-spinel");
  }

  completeObjective(name) {
    this.model.hidden = false;
    switch (name) {
      case "give-spinel":
        this.model.completed = true;
        break ;
    }
  }
}
