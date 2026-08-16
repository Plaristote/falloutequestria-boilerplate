export default function getSentinelController() {
  switch (game.getVariable("gameEnding")) {
    case "sentinel-rathian":
      return "rathian";
    case "sentinel-overmare":
      return "overmare";
    case "sentinel-player":
      if (game.player.getBuff("dark-magic-buff") != null)
        return "sombra";
      return "player";
  }
  return null;
}
