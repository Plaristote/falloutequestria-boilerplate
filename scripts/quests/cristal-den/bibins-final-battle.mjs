import {QuestHelper} from "../helpers.mjs";

export default class BibinsFinalBattle extends QuestHelper {
  initialize() {
    this.model.location = "cristal-den";
    this.model.addObjective("recruitSlavers", this.tr("recruitSlavers"));
    this.model.addObjective("recruitCaravaneers", this.tr("recruitCaravaneers"));
    this.model.addObjective("battle", this.tr("battle"));
  }

  onSlaversRecruited() {
    this.model.completeObjective("recruitSlavers");
  }

  onCaravaneersRecruited() {
    this.model.completeObjective("recruitCaravaneers");
  }

  startBattle() {
    game.switchToLevel("cristal-den-slums", () => {
      // TODO setup the battle
    });
  }

  onBattleWon() {
    this.model.completeObjective("battle");
    this.model.completed = true;
  }

  onBattleLost() {
    this.model.failObjective("battle");
    this.model.failed = true;
  }
}
