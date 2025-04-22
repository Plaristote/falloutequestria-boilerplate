import {skillCheck} from "../cmap/helpers/checks.mjs";

export default class OutdoorsCheck {
  constructor(party, groups) {
    this.party = party;
    this.groups = groups;
    this.success = false;
    this.character = party.mostSkilledAt("outdoorsman");
  }

  run() {
    console.log("running OutdoorsmanCheck against", this.groups.length, "groups");
    for (let i = 0 ; i < this.groups.length ; ++i) {
      if (this.checkGroup(this.groups[i])) break ;
    }
  }

  checkGroup(group) {
    this.success = skillCheck(this.character, "outdoorsman", {
      target: group.avoidRoll,
      dice: 20
    });
    if (this.success)
      this.gainExperience(group);
    return this.success;
  }

  gainExperience(group) {
    console.log("DONE. Gaining experience now");
    const reward = Math.ceil(group.avoidRoll / 7);
    this.party.addExperience(reward);
    game.appendToConsole(i18n.t("messages.encounter-avoid-roll-success", {
      xp: reward
    }));
  }
}

