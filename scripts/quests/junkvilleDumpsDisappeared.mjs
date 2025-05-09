import {QuestHelper, requireQuest} from "./helpers.mjs";

const captiveCount = 3;
const questName = "junkvilleDumpsDisappeared";

function hasQuest() { return game.quests.hasQuest(questName); }
function getQuest() { return game.quests.getQuest(questName); }

export function startLookingForDisappearedPonies() {
  return requireQuest(questName);
}

export function isLookingForDisappearedPonies() {
  let result = false;
  if (hasQuest())
    result = !getQuest().script.captiveFound();
  console.log(questName, "-> isLookingForDisappearedPonies?", result);
  return result;
}

export function hasFoundDisappearedPonies() {
  let result = false;
  result = hasQuest() && getQuest().script.captiveFound();
  console.log(questName, "-> hasFoundDisappearedPonies?", result);
  return result;
}

export function onDisappearedPoniesFound() {
  requireQuest(questName).completeObjective("find-disappeared");
  console.log(questName, "-> onDisappearedPoniesFound");
}

export function authorizeCaptiveRelease() {
  const quest = requireQuest("junkvilleDumpsDisappeared");
  quest.setVariable("authorizeCaptiveRelease", true);
}

export function captiveReleaseAuthorized() {
  const quest = getQuest();
  const result = quest && quest.getVariable("authorizeCaptiveRelease") === true;
  console.log(questName, "-> captiveReleaseAuthorized", result);
  return result;
}

export function areCaptorsDead() {
  return game.hasVariable("junkvilleDogsWipedOut");
}

export function enableScavengerRansom(mode) {
  getQuest().setVariable("ransom", mode);
}

export function skipScavengerRansom() {
  getQuest().setVariable("ransomSkipped", 1);
}

export function dogsExpectingSupplies() {
  const quest = getQuest();
  return quest && quest.hasVariable("ransom") && !quest.isObjectiveCompleted("bring-ransom");
}

export class JunkvilleDumpsDisappeared extends QuestHelper {
  initialize() {
    this.model.location = "junkville";
  }
  
  get xpReward() {
    return this.captiveAlive() ? 1000 : 750;
  }

  get savedCount() {
    return this.model.hasVariable("save-count") ? this.model.getVariable("save-count") : 0;
  }

  set savedCount(value) {
    this.model.setVariable("save-count", value);
  }

  get killedCaptiveCount() {
    return this.model.hasVariable("killed-captives") ? this.model.getVariable("killed-captives") : 0;
  }

  set killedCaptiveCount(value) {
    this.model.setVariable("killed-captives", value);
  }

  get suppliesRequested() {
    return this.model.hasVariable("ransom");
  }

  get ransomActive() {
    return this.model.hasVariable("ransom") && this.model.getVariable("ransom") == "normal";
  }

  get ransomSkipped() {
    return this.model.hasVariable("ransomSkipped");
  }

  get requiredSupplies() {
    return { "medikit": 1, "healing-potion": 5 };
  }

  get woundedDogs() {
    return this.model.getVariable("woundedDogs", 3);
  }

  set woundedDogs(value) {
    this.model.setVariable("woundedDogs", value);
    if (value <= 0)
      this.model.completeObjective("healWoundedDogs");
  }

  canInventoryProvideRequiredSupplies(inventory) {
    return inventory.count("health-potion") >= 5 && inventory.count("doctor-bag") >= 1;
  }

  transferRequiredSupplies(inventorySource, inventoryTarget) {
    if (inventorySource) {
      inventorySource.removeItemOfType("health-potion", 5);
      inventorySource.removeItemOfType("doctor-bag");
    }
    if (inventoryTarget) {
      inventoryTarget.addItemOfType("health-potion", 5);
      inventoryTarget.addItemOfType("doctor-bag");
    }
  }

  getObjectives() {
    const objectives = [];

    objectives.push({
      label: this.tr("find-disappeared"),
      success: this.captiveFound()
    });
    if (this.model.isObjectiveCompleted("find-disappeared")) {
      if (this.model.isObjectiveCompleted("healWoundedDogs")) {
        objectives.push({
          label: this.tr("heal-wounded-dogs"), success: true
        });
      } else if (this.ransomActive) {
        objectives.push({
          label: this.tr("bring-ransom"),
          success: this.captiveAlive() && this.model.isObjectiveCompleted("bring-ransom"),
          failed: !this.captiveAlive()
        });
      }
      objectives.push({
        label: this.tr("save-all-captives"),
        success: this.captiveAlive() && this.model.isObjectiveCompleted("save-captives"),
        failed: !this.captiveAlive()
      });
      if (!this.captiveAlive()) {
        objectives.push({
          label: this.tr("save-some-captives"),
          success: this.model.isObjectiveCompleted("save-captives"),
          failed: this.captiveAllDead()
        });
      }
      objectives.push({
        label: this.tr("report-success"),
        success: this.model.isObjectiveCompleted("report-success")
      });
    }
    return objectives;
  }

  onCaptiveKilled() {
    this.killedCaptiveCount++;
    if (this.captiveAllDead())
      this.model.completed = this.model.failed = true;
  }

  setDiamondDogsAsHostiles(value) {
    this.model.setVariable("dogs-hostile", value);
  }

  captiveFound() {
    return this.model.isObjectiveCompleted("find-disappeared");
  }

  captiveSaved() {
    this.savedCount++;
    if (this.savedCount == captiveCount)
      this.model.completeObjective("save-all-captives");
    if (this.savedCount + this.killedCaptiveCount == captiveCount)
      this.model.completeObjective("save-captives");
  }

  captiveAlive() {
    return !this.model.hasVariable("killed-captives");
  }

  captiveAllDead() {
    return !this.captiveAlive() && this.killedCaptiveCount >= captiveCount;
  }

  captiveKilledByDogs() {
    return this.model.getVariable("dogs-hostile") === true;
  }

  completeObjective(name, success) {
    console.log("JUNKVILLEDUMPSDISAPPEARED COMPLETEOBJECTIVE", name, success);
    if (name === "save-captives") {
      this.model.completed = true;
      this.model.failed = !success;
    } else if (name === "bring-ransom" && success) {
      const negociateQuest = requireQuest("junkvilleNegociateWithDogs");
      negociateQuest.completeObjective("bring-medical-supplies");
      level.findGroup("wounded").objects.forEach(dog => dog.script.onHealed());
    }
  }

  onCompleted() {
    super.onCompleted();
    if (this.model.isObjectiveCompleted("save-all-captives"))
      game.dataEngine.addReputation("junkville", 100);
    else
      game.dataEngine.addReputation("junkville", this.model.failed ? -75 : 50);
  }
}
