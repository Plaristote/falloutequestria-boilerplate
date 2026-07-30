import {
  hasNegotiatedBanditsReward,
  hasImprovedBanditsReward,
  banditsRewardClaimed,
  claimBanditsReward
} from "../../quests/junkville/cavernBandits.mjs";

// Used while Randy is still standing in the cavern, right after the raid
// on the bandits is over - a short, self-contained exchange, separate
// from the fuller report-back conversation that happens later at the inn.
export default class Dialog {
  constructor(dialog) {
    this.dialog = dialog;
  }

  canClaimReward() {
    return hasNegotiatedBanditsReward() && hasImprovedBanditsReward() && !banditsRewardClaimed();
  }

  claimReward() {
    claimBanditsReward();
    game.player.inventory.addItemOfType("bottlecaps", 150);
  }
}
