import CaravanProcess from "../../caravan.mjs";
import inventoryGuard from "../../equipments/cristal-den-guards.mjs";

let instance = null;

const caravanPartyName = "cristal-den-patrol-escort";

class PatrolProcess extends CaravanProcess {
  get quest() {
    return game.quests.getQuest("cristal-den/copper-patrol")
  }

  get hasCaravan() {
    return this.quest && !this.quest.isObjectiveCrossedOff("patrol");
  }

  get variableStore() {
    return this.quest;
  }

  caravanPartyData(members = null) {
    if (members === null) {
      members = [];
      for (let i = 0 ; i < this.escortMembersCount ; ++i) {
        members.push({ sheet: "cristal-den/guard", inventory: inventoryGuard(i) });
      }
    }
    return {
      "name": caravanPartyName,
      "members": members,
      "faction": "cristal-den"
    }
  }

  start() {
    this.startCaravanWithPath([
      "cristal-den",
      { x: 850, y: 1748 },
      { x: 900, y: 1600 },
      { x: 1000, y: 1500 },
      { x: 1100, y: 1600 },
      { x: 1150, y: 1700 },
      { x: 1050, y: 1840 },
      "cristal-den"
    ]);
  }

  onCaravanStarted() {
    this.party = this.createCaravanParty();
    this.triggerNextStep();
  }

  onCaravanFailure() {
    this.quest.failObjective("patrol");
    this.quest.setVariable("survivorsCount", this.party.list.length);
    this.quest.failed = true;
    this.deleteCaravanParty();
  }

  onDestinationReached() {
    this.quest.completeObjective("patrol");
    super.onDestinationReached();
  }
}

export default function() {
  if (!instance)
    instance = new PatrolProcess;
  return instance;
}
