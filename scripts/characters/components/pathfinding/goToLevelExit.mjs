export default function goToLevelExit(character, fallback) {
  const zone = level.findZones(zone => zone.type == "exit" && zone.target == "")[0];
  const target = level.getClosestPosition(zone, character.position);
  const actions = character.actionQueue;

  actions.reset();
  actions.pushMovement(target.x, target.y, zone.floor);
  actions.pushScript({
    onTrigger: () => character.isUnique ? game.uniqueCharacterStorage.detachCharacter(character) : level.deleteObject(character),
    onCancel: fallback
  });
  if (!actions.start())
    fallback();
}
