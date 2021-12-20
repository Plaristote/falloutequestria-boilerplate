class Level {
  onZoneEntered(zoneName, object) {
    if (zoneName.startsWith("exit-") && object.path === "passerby.passerby#5") {
      console.log("robber should escape");
    }
  }
}

export function create() {
  return new Level;
}
