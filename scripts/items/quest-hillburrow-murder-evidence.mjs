import {ItemBehaviour} from "./item.mjs";
import {onEvidenceRevealed} from "../quests/hillburrow/oldSheriffMurder.mjs";

export default class QuestHillburrowMurderEvidence extends ItemBehaviour {
  constructor(model) {
    super(model);
    this.requiresTarget = this.triggersCombat = false;
  }

  get useModes() {
    return this.evidenceRevealed ? [] : ["use"];
  }

  get evidenceRevealed() {
    return this.model.hasVariable("revealed");
  }

  useOn(target) {
    onEvidenceRevealed();
    this.model.setVariable("revealed", 1);
    return true;
  }
}
