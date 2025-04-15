import {QuestHelper} from "../helpers.mjs";

export default class extends QuestHelper {
  initialize() {
    this.model.location = "thornhoof";
    this.model.addObjective("lead-caravan", this.tr("lead-caravan"));
    this.model.addObjective("convince-narbi-fargo", this.tr("convince-narbi-fargo"));
  }

  get playerPaidInAdvance() {
    return this.model.hasVariable("paidInAdvance");
  }

  get playerAdvanceAmount() {
    return this.model.getVariable("paidInAdvance", 0);
  }

  completeObjective(name) {
    switch (name) {
    case "convince-narbi-fargo":
      this.model.addObjective("convince-laurie", this.tr("convince-laurie"));
      break ;
    }
  }
}
