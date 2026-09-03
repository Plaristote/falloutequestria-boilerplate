import {QuestHelper} from "../helpers.mjs";

const monsterCount = 5;
const clueCount = 4;
const cluesXp = 500;

export default class extends QuestHelper {
  get xpReward() {
    return 1500 + (this.foundClues ? cluesXp : 0);
  }

  initialize() {
    this.model.location = "capital-ruins";
  }

  getDescription() {
    let text = `<p>${this.model.tr("description")}</p>`;

    this.events.forEach(event => {
      text += "<p>" + this.model.tr(`desc-${event}`) + "</p>";
    })
    return text;
  }

  get killCount() {
    return this.model.getVariable("killed", 0);
  }

  set killCount(value) {
    this.model.setVariable("killed", value);
  }

  get clues() {
    return JSON.parse(this.model.getVariable("clues", "[]"));
  }

  set clues(value) {
    this.model.setVariable("clues", JSON.stringify(value));
  }

  get foundClues() {
    return this.clues.length >= clueCount;
  }

  onMonsterKilled() {
    this.killCount++;
    if (this.killCount >= monsterCount) {
      this.pushUniqueEvent("solved");
      this.model.completed = true;
    }
  }

  onEntityKilled() {
    this.model.setVariable("entityKilled", 1);
    if (this.foundClues)
      this.pushUniqueEvent("killedEntity");
  }

  findClue(clueId) {
    if (this.clues.indexOf(clueId) < 0) {
      const clues = this.clues;
      clues.push(clueId);
      this.clues = clues;
      if (this.foundClues) {
        this.pushUniqueEvent("foundClues");
        if (this.model.hasVariable("entityKilled") && !this.hasEvent("killedEntity"))
          this.pushUniqueEvent("killedEntity");
        if (this.model.completed)
          game.playerParty.addExperience(cluesXp);
      }
    }
  }

  getObjectives() {
    const objectives = [{
      label: `${this.model.tr("killCount")} ${this.killCount}/${monsterCount}`,
      success: this.killCount >= monsterCount
    }];

    if (this.clues.length > 0) {
      objectives.push({
        label: `${this.model.tr("findClues")} ${this.clues.length}/${clueCount}`,
        success: this.foundClues
      });
    }
    if (this.killCount >= monsterCount) {
      objectives.push({
        label: this.model.tr("report-to-laurie"),
        success: this.model.isObjectiveCompleted("report-to-laurie"),
        failed: !this.model.isObjectiveCompleted("report-to-laurie") && game.getCharacter("cristal-den/caravan-leader").isAlive()
      });
    }
    return objectives;
  }
}
