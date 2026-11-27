export const HEIRS = {
  bitty: {
    name: "Bitty",
    deadVariable: "potiokBittyDead",
    // Existing quest: coal mine at Hillburrow.
    questName: "hillburrow/sabotage",
  },
  rewan: {
    name: "Rewan",
    deadVariable: "potiokRewanDead",
    // Slave-powered mine/factory on the outskirts, security problem (slaves being stolen).
    questName: "cristal-den/rewan-security",
  },
  crafty: {
    name: "Crafty",
    deadVariable: "potiokCraftyDead",
    // TODO: content not finalized yet (leaning toward farming tools/equipment).
    questName: "cristal-den/crafty-workshop",
  },
};

export function matriarchDead() {
  return game.hasVariable("potiokMatDead");
}

export function isHeirDead(heirId) {
  return game.hasVariable(HEIRS[heirId].deadVariable);
}

export function rewanDead() {
  return isHeirDead("rewan");
}

export function craftyDead() {
  return isHeirDead("crafty");
}

export function bittyDead() {
  return isHeirDead("bitty");
}

export function allHeirsDead() {
  return Object.keys(HEIRS).every(isHeirDead);
}

export function potiokRuleEnded() {
  return matriarchDead() && allHeirsDead();
}

// Called by each Potiok's onDied once its "dead" variable is set. Lets the
// Changeling Queen's quest notice that the dynasty is over without waiting
// for the player to report.
export function notifyPotiokDeath() {
  const quest = game.quests.getQuest("cristal-den/potiok-chaos");

  if (quest && quest.script && quest.script.checkEnding)
    quest.script.checkEnding();
}
