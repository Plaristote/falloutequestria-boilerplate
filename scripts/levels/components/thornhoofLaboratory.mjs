function useElevator(currentFloor, floor) {
  const floors = {
    "0": { level: "thornhoof-industrial-zone", zone: "laboratory-elevator-entry" },
    "1": { level: "thornhoof-laboratory", zone: "entrance" }
  };
  const pickedFloor = floors[floor];

  if (currentFloor == floor)
    level.insertPartyIntoZone(game.playerParty, pickedFloor.zone);
  else
    game.switchToLevel(pickedFloor.level, pickedFloor.zone)
}

export function laboratoryElevatorPrompt(currentFloor) {
  game.openPrompt(i18n.t("elevator-prompt"), [
    { label: "1", callback: useElevator.bind(this, currentFloor, 1) },
    { label: "L", callback: useElevator.bind(this, currentFloor, 0) }
  ]);
}

export default class {
  onZoneEntered(zoneName, character) {
    if (character == game.player && zoneName == "laboratory-elevator")
      laboratoryElevatorPrompt(0);
  }
}
