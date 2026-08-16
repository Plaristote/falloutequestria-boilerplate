import {DealWithRathian, SentinelOutcome} from "../characters/rathian/flags.mjs";
import getSentinelController from "./sentinel.mjs";

export default function getRathianFate() {
  const rathianQuest = game.quests.getQuest("stable-103/rathian");
  const rathianCharacter = game.getCharacter("rathian");
  const flag = rathianCharacter ? rathianCharacter.getVariable("dealWithRathian", 0) : 0;

  if (!rathianQuest || !rathianQuest.isObjectiveCompleted("dealWithRathian"))
    return "unknown";

  if (!rathianCharacter.isAlive()) {
    if (rathianQuest && rathianQuest.getVariable("rathianMurdered") == 1)
      return "murdered";
    return "died";
  }
  if (game.hasVariable("rathianBetrayedAtStable"))
    return "betrayed";
  if (getSentinelController() === "rathian")
    return "rules-sentinel";
  if ((flag & DealWithRathian.LeftWithPlayer) > 0)
    return "left-with-player";
  if ((flag & DealWithRathian.LeaveBehind) > 0 && (flag & DealWithRathian.CellOpened) > 0)
    return "returned-to-junkville";
  if ((flag & DealWithRathian.LeaveBehind) > 0)
    return "joined-golden-herd";
  return "escaped-unknown";
}
