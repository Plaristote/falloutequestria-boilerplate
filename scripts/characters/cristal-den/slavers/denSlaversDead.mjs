const variableKey = "denSlaversDead";

export function areDenSlaversDead() {
  return game.hasVariable(variableKey);
}

export function updateDenSlaversDead() {
  const slavers = level.find("slavers-den.guards.*");
  const boss = level.findObject("slavers-den.slave-master");
  const lieutnant = level.findObject("slavers-den.slave-lieutnant");

  console.log("updateDenSlaversDead");
  slavers.push(boss);
  slavers.push(lieutnant);
  for (let i = 0 ; i < slavers.length ; ++i) {
    if (slavers[i].isAlive()) return ;
  }
  console.log("-> they are all dead");
  game.setVariable(variableKey, 1)
}
