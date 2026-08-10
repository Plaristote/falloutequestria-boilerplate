import {QuestHelper, QuestFlags, requireQuest} from "../helpers.mjs";
import {AlarmLevel} from "../../characters/components/alarm.mjs";

const questName = "cristal-den/bibins-enforcers-sabotage";

export function onBlewWeaponStash() {
  const quest = requireQuest(questName, QuestFlags.HiddenQuest);
  const target = [36, 17, 2];

  if (!quest.isObjectiveCompleted("destroyedStash")) {
    quest.completeObjective("destroyedStash");
    level.findGroup("police-hq")
      .find(candidate => candidate.objectName.startsWith("guard"))
      .forEach(guard => guard.script.receiveAlarmSignal(...target, game.player, AlarmLevel.ShootOnSight));
  }
}

export default class BibinsEnforcerSabotage extends QuestHelper {
  constructor(model) {
    super(model);
    this.xpReward = 750;
  }

  initialize() {
    this.model.location = "cristal-den";
    this.model.addObjective("destroyedStash");
  }
}
