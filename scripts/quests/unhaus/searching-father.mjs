import {QuestHelper} from "../helpers.mjs";

// Suggested path: quests/unhaus/searching-father.mjs
//
// The queen wants Backtrack, a stallion searching for his kidnapped
// daughter, dealt with before he blows the hive's cover. Her preferred
// plan is for the player to lead him into the hive so her guards can
// grab him quietly; killing him outright still counts as success, but
// the queen isn't happy about the cleanup it costs her.
//
// This script only tracks quest state; it assumes level-side wiring
// that doesn't exist yet:
//   - a "unhaus/backtrack" character sheet for Backtrack himself
//   - a trigger (guard ambush / hive threshold) that calls onLedToTrap()
//     once the player has walked him inside
//   - optional level/NPC logic calling onSecrecyCompromised() if he
//     escapes or raises the alarm before being dealt with either way
export default class SearchingFather extends QuestHelper {
  get xpReward() {
    // Doing it the queen's way is worth more to her than a mess to clean up.
    return this.killedDirectly ? 850 : 1100;
  }

  initialize() {
    this.model.location = "unhaus";
    this.model.addObjective("leadOrKillFather", this.model.tr("lead-or-kill-father"));
  }

  getDescription() {
    let text = `<p>${this.model.tr("intro")}</p>`;

    if (this.model.isObjectiveCompleted("leadOrKillFather")) {
      if (this.killedDirectly)
        text += `<p>${this.model.tr("desc-killed-directly")}</p>`;
      else
        text += `<p>${this.model.tr("desc-led-to-trap")}</p>`;
    }
    if (this.model.hasObjective("reportToQueen"))
      text += `<p>${this.model.tr("desc-report-to-queen")}</p>`;
    if (this.compromised)
      text += `<p>${this.model.tr("desc-compromised")}</p>`;
    return text;
  }

  get father() {
    return typeof level != "undefined" ? level.findObject("unhaus.backtrack") : null;
  }

  get killedDirectly() {
    return this.model.getVariable("killedDirectly", 0) == 1;
  }

  set killedDirectly(value) {
    this.model.setVariable("killedDirectly", value ? 1 : 0);
  }

  get compromised() {
    return this.model.hasVariable("compromised");
  }

  // Called by the hive's ambush trigger once the player has led Backtrack inside.
  onLedToTrap() {
    this.killedDirectly = false;
    this.model.completeObjective("leadOrKillFather");
    this.model.addObjective("reportToQueen", this.model.tr("report-to-queen"));
    this.model.completed = true;
  }

  // Called by the character-kill system if the player kills Backtrack directly,
  // wherever that happens to take place.
  onCharacterKilled(character) {
    if (character.characterSheet !== "unhaus/backtrack")
      return ;
    this.killedDirectly = true;
    if (!this.model.hasObjective("leadOrKillFather"))
      this.model.addObjective("leadOrKillFather", this.model.tr("lead-or-kill-father"));
    this.model.completeObjective("leadOrKillFather");
    this.model.addObjective("reportToQueen", this.model.tr("report-to-queen"));
    this.model.completed = true;
  }

  // Called by level/NPC logic if Backtrack manages to escape or raise the
  // alarm before being dealt with either way, blowing the hive's secrecy.
  onSecrecyCompromised() {
    this.model.setVariable("compromised", 1);
    this.model.failed = true;
  }
}
