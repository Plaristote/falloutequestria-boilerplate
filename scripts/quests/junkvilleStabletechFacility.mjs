import {QuestHelper, requireQuest} from "./helpers.mjs";

const questName = "junkvilleStabletechFacility";
const rathianScript = "rathian/stabletech-factory-quest.mjs";

function hasQuest() { return game.quests.hasQuest(questName); }
function getQuest() { return game.quests.getQuest(questName); }

export function isFacilityQuestAvailable() {
  return !hasQuest() || getQuest().getScriptObject().isObjectiveCompleted("enter-facility");
}

function ifRathianIsInvolved(callback) {
  const rathian = game.uniqueCharacterStorage.getCharacter("rathian");
  if (rathian && rathian.scriptName === rathianScript)
    callback(rathian.getScriptObject());
}

const rathianPopPoints = {
  "junkville-dumps":               { condition: "shouldPopAtDumps", position: [19,189] },
  "junkville-stabletech-facility": { condition: "shouldPopAtFacility", position: [29,25] }
};

function tryToPopRathianInCurrentLevel() {
  const popPoint = rathianPopPoints[level.name];
  if (popPoint) {
    ifRathianIsInvolved(rathian => {
      if (rathian[popPoint.condition]()) {
        game.uniqueCharacterStorage.loadCharacterToCurrentLevel("rathian", ...popPoint.position);
        rathian.state++;
      }
    });
  }
}

export class JunkvilleStabletechFacility extends QuestHelper {
  initialize() {
    const mainQuest = requireQuest("celestialDevice");

    this.model.location = "junkville";
    mainQuest.addObjective("explore-junkville-facility", mainQuest.script.tr("explore-junkville-facility"));
  }

  get xpReward() { return 2500; }

  get learnedFromRathian() { return this.model.getVariable("learnedFromRathian", 0) == 1; }
  set learnedFromRathian(value) { return this.model.setVariable("learnedFromRathian", value ? 1 : 0); }

  getDescription() {
    let text = "";
    if (this.learnedFromRathian)
      text += this.model.tr("description-rathian-intel");
    else
      text += this.model.tr("description-no-intel");
    if (this.model.isObjectiveCompleted("find-blueprints"))
      text += this.model.tr("description-done");
    return text;
  }

  onItemPicked(item) {
    if (item.itemType === "celestial-device-blueprints") {
      this.model.completeObjective("explore-facility");
      this.model.completeObjective("find-blueprints");
      this.model.completed = true;
    }
  }

  getObjectives() {
    const objectives = [];

    objectives.push({
      label: this.tr("enter-facility"),
      success: this.model.isObjectiveCompleted("enter-facility")
    });
    objectives.push({
      label: this.tr("explore-facility"),
      success: this.model.isObjectiveCompleted("explore-facility")
    });
    if (this.model.isObjectiveCompleted("explore-facility")) {
      objectives.push({
        label: this.tr("find-blueprints"),
        success: this.model.isObjectiveCompleted("find-blueprints")
      });
    }
    return objectives;
  }

  loadJunkvilleDumps() {
    tryToPopRathianInCurrentLevel();
  }

  loadJunkvilleFacility() {
    const quest = requireQuest(questName);
    quest.completeObjective("enter-facility");
    tryToPopRathianInCurrentLevel();
  }
}
