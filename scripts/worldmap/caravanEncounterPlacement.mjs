function createCaravanDynamicObject(i) {
  const caravan = level.factory().generateDynamicObject(`caravan#${i + 1}`);
  const zone = caravan.addControlZone();

  caravan.spriteName = "caravans";
  caravan.setAnimation(i % 2 ? '1' : '2');
  caravan.cover = 80;
  caravan.zoneBlocked = false; // for starters, it will be enabled later
  zone.addRelativePosition(-2,  0);
  zone.addRelativePosition(-2, -1);
  for (let x = -1 ; x <= 0 ; ++x) {
    for (let y = -2 ; y <= 1 ; ++y) {
      zone.addRelativePosition(x, y);
    }
  }
  return caravan;
}

function tryPosition(caravan, position) {
  const { x, y } = position;
  const maxWidth = level.tilemap.mapSize.width;
  const maxHeight = level.tilemap.mapSize.height;

  if (x >= 0 && x < maxWidth && y >= 0 && y < maxHeight) {
    level.setObjectPosition(caravan, x, y);
    if (caravan.getControlZoneOccupants().length < 2)
      return true;
  }
  return false;
}

function placeCaravanNearPosition(position, caravan) {
  const targetX   = position.x;
  const targetY   = position.y;
  const maxWidth  = level.tilemap.mapSize.width;
  const maxHeight = level.tilemap.mapSize.height;
  const maxSpiral = Math.max(maxWidth, maxHeight);
  let spiralDistance = 1;

  while (spiralDistance < maxSpiral) {
    // Upper
    for (let dx = -spiralDistance; dx <= spiralDistance; dx++) {
      const x = targetX + dx;
      const y = targetY - spiralDistance;
      if (tryPosition(caravan, {x, y})) return true;
    }

    // Right
    for (let dy = -spiralDistance + 1; dy <= spiralDistance; dy++) {
      const x = targetX + spiralDistance;
      const y = targetY + dy;
      if (tryPosition(caravan, {x, y})) return true;
    }

    // Bottom
    for (let dx = spiralDistance - 1; dx >= -spiralDistance; dx--) {
      const x = targetX + dx;
      const y = targetY + spiralDistance;
      if (tryPosition(caravan, {x, y})) return true;
    }

    // Left
    for (let dy = spiralDistance - 1; dy >= -spiralDistance + 1; dy--) {
      const x = targetX - spiralDistance;
      const y = targetY + dy;
      if (tryPosition(caravan, {x, y})) return true;
    }

    spiralDistance++;
  }
  return false;
}

function findSpawnReferences() {
  let escort = [];

  for (let i = 0 ; i < level.objects.length ; ++i) {
    if (level.objects[i].objectName.startsWith("caravan-escort"))
      escort.push(level.objects[i]);
  }
  return escort;
}

export default function loadCaravansIntoLevel(caravanCount, spawnReference) {
  const factory = level.factory();
  const escort = spawnReference ? [spawnReference] : findSpawnReferences();
  let escortIt = 0;

  try {
    for (let i = 0 ; i < caravanCount ; ++i) {
      const caravan = createCaravanDynamicObject(i);
      const spawnAround = escort[escortIt];
      const positionned = placeCaravanNearPosition(spawnAround.position, caravan);

      if (!positionned) {
        console.log("CARAVAN.MJS: failed to position caravan 😗 !");
        level.deleteObject(caravan);
        break ;
      }
      caravan.zoneBlocked = true;
      console.log("CARAVAN.MJS: successfully placed caravan 😎 !", caravan.position);
      if (escortIt >= escort.length)
        escortIt = 0;
      else
        escortIt++;
    }
  } catch (err) {
    console.log("loadCaravansIntoLevel crashed:", err);
  }
}
