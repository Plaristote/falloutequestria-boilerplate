export function canSlaversPop() {
  return false; // TODO
}

export function slaversParty(difficultyRoll) {
  const list = [];

  return {
    name: "Slavers",
    avoidRoll: (70 + difficultyRoll / 3),
    members: list
  };
}
