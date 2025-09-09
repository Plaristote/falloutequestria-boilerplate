class Dialog {
  constructor(dialog) {
    this.dialog = dialog;
  }

  get gym() {
    return this.dialog.npc.parent;
  }

  get openForMatches() {
    return this.gym.script.openForMatches;
  }

  get canPlaceABet() {
    return this.gym.getVariable("betSolved", 1) == 0;
  }

  get hasPendingWonBet() {
    return this.gym.getVariable("betWon", 0) == 1;
  }

  get hasPendingWonFight() {
    return this.gym.getVariable("fightWon", 0) == 1;
  }

  get playerHasRingName() {
    return this.gym.hasVariable("ringName");
  }

  get ringName() {
    return this.gym.script.ringName;
  }

  get currentOpponentName() {
    return this.gym.script.playerCurrentOpponent.displayName;
  }

  getEntryPoint() {
    if (this.hasPendingWonBet)
      return "bet-earnings";
    if (this.hasPendingWonFight)
      return this.gym.script.playerCurrentOpponent ? "fight-earnings" : "fight-champion-earnings";
    if (this.openForMatches) {
      if (!this.dialog.npc.hasVariable("met")) {
        this.dialog.npc.setVariable("met", 1);
        if (game.player.statistics.strength > 8)
          return "introduction-for-strong";
        return "introduction";
      }
      return "boxing-entry";
    }
    return "boxing-closed";
  }

  onAskAboutBets() {
    if (this.openForMatches)
      return "bets"
    return "boxing-closed";
  }

  onAskAboutRing() {
    if (this.gym.script.playerCurrentOpponent == null)
      return "no-more-challengers";
    if (this.openForMatches)
      return this.playerHasRingName ? "fight" : "pick-ring-name";
    return "boxing-closed";
  }

  bets() {
    const fighters = this.gym.script.nextNpcFighters;
    const self = this;

    return {
      text: this.dialog.t("bets", { name1: fighters[0].displayName, name2: fighters[1].displayName }),
      answers: [
        { symbol: "betOnA", textHook: () => { return this.dialog.t("placeBet", { name: fighters[0].displayName }); }, hook: this.onPlaceBet.bind(this, fighters[0]) },
        { symbol: "betOnB", textHook: () => { return this.dialog.t("placeBet", { name: fighters[1].displayName }); }, hook: this.onPlaceBet.bind(this, fighters[1]) },
        "exit-bets"
      ]
    };
  }

  onPlaceBet(fighter) {
    this.selectedFighter = fighter;
    return "set-bet-amount";
  }

  setBetAmount() {
    const answers = [];
    const capsCount = game.player.inventory.count("bottlecaps");
    const options = [300,200,100,50,10];

    options.forEach(option => {
      if (capsCount >= option)
        answers.push({ symbol: `bet${option}`, textHook: function() { return `${option}`; }, hook: this.onSetBetAmount.bind(this, option) });
    });
    answers.push("exit-bets");
    return { answers: answers };
  }

  onSetBetAmount(amount) {
    console.log("onSetBetAmount");
    this.gym.script.placeBet(this.selectedFighter, amount);
    game.player.inventory.removeItemOfType("bottlecaps", amount);
    return "bet-accepted";
  }

  get selectedFighterName() {
    return this.selectedFighter.displayName;
  }

  get betPotentialGains() {
    return this.gym.getVariable("betAmount") * 2;
  }

  betEarnings() {
    this.gym.unsetVariable("betWon");
    game.player.inventory.addItemOfType("bottlecaps", this.betPotentialGains);
  }

  fightWinningPriceAt(it) {
    switch (it) {
      case 1: return 250;
      case 2: return 400;
      case 3: return 800;
    }
    return 100;
  }

  get fightWinningPrice() {
    return this.fightWinningPriceAt(this.gym.script.playerWinCount);
  }

  get nextFightWinningPrice() {
    return this.fightWinningPriceAt(this.gym.script.playerWinCount + 1);
  }

  fightEarnings() {
    this.gym.unsetVariable("fightWon");
    game.player.inventory.addItemOfType("bottlecaps", this.fightWinningPrice);
  }

  fight() {
    const opponent = this.gym.script.playerCurrentOpponent;
    const winCount = this.gym.script.playerWinCount;

    if (winCount > 0)
        return this.dialog.t(`fight-${winCount}`, {opponent: opponent.displayName});
    return null;
  }

  pickRingName() {
    const names = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17];
    const answers = [];

    names.forEach(name => {
      answers.push(ringNameOption(this.gym, name));
    });
    return { answers: answers };
  }

  onStartFight() {
    this.gym.script.startPlayerCombat();
  }
}

function ringNameOption(gym, name) {
  return {
    symbol: `heroName-${name}`,
    text: gym.script.labelForRingName(name),
    hook: function() {
      gym.setVariable("ringName", name);
      return "fight";
    }
  };
}

export function create(dialog) {
  return new Dialog(dialog);
}
