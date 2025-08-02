function healNextPartyMember(self, i) {
  const target = game.playerParty.list[i];
  self.heal(target, function() {
    if (i >= game.playerParty.list.length)
      healNextPartyMember(self, i + 1);
  });
}

function canPlayerAfford(cost) {
  return game.player.inventory.count("bottlecaps") >= cost;
}

export default class HealerComponent {
  constructor(self) {
    this.self = self;
    this.dialog = self.dialog;
    this.baseCost = 12;
  }

  healPrompt() {
    const answers = [];

    if (this.canHeal(game.player)) {
      answers.push({
        symbol: "ask-heal-player",
        textHook: () => { return this.dialog.t("ask-heal-player"); },
        hook: this.cashPrompt.bind(this, game.player, this.evaluateHealCost(game.player)),
        availableHook: this.canHeal.bind(this, game.player)
      });
    }
    if (game.playerParty.list.length > 1 && this.canHealParty()) {
      answers.push({
        symbol: "ask-heal-party",
        textHook: () => { return this.dialog.t("ask-heal-party"); },
        hook: this.cashPrompt.bind(this, game.playerParty, this.evaluatePartyHealCost()),
        availableHook: this.canHealParty.bind(this)
      });
    }
    answers.push("cancel-heal-prompt");
    return {
      text: this.makeHealPromptText(),
      answers: answers
    };
  }

  cashPrompt(target, cost) {
    const answers = [];

    answers.push({
      symbol: "ask-heal-payup",
      textHook: () => { return this.dialog.t("ask-heal-payup"); },
      hook: this.healHook.bind(this, target, cost),
      availableHook: canPlayerAfford.bind(this, cost)
    });
    answers.push({
      symbol: "ask-heal-something-else",
      textHook: () => { return this.dialog.t("ask-heal-something-else"); },
      hook: this.healPrompt.bind(this)
    });
    answers.push("cancel-heal-cash");
    return {
      text: this.makeCashPromptText(target, cost),
      answers: answers
    };
  }

  healHook(target, cost) {
    game.player.inventory.removeItemOfType("bottlecaps", cost);
    if (target === game.playerParty)
      this.healParty();
    else
      this.heal(target);
    return "heal-done";
  }

  makeHealPromptText() {
    return this.dialog.t("heal-prompt");
  }

  makeCashPromptText(target, cost) {
    return this.dialog.t("cash-prompt", { cost: cost });
  }

  percentToHeal(target) {
    return 100 - target.statistics.hitPoints / target.statistics.maxHitPoints * 100;
  }

  canHeal(target) {
    return target.statistics.hitPoints < target.statistics.maxHitPoints;
  }

  canHealParty() {
    for (let i = 0 ; i < game.playerParty.list.length ; ++i) {
      if (this.canHeal(game.playerParty.list[i]))
        return true;
    }
    return false;
  }

  heal(target, callback) {
    if (this.canHeal(target)) {
      game.asyncAdvanceTime(this.evaluateHealDuration(target), function() {
        target.statistics.hitPoints = target.statistics.maxHitPoints
        if (callback) callback();
      });
      return true;
    }
    return false;
  }

  healParty() {
    if (this.canHealParty()) {
      healNextPartyMember(this, 0);
      return true;
    }
    return false;
  }

  evaluateHealDuration(target) {
    const skill  = this.dialog.npc.statistics.medicine;
    const points = target.statistics.maxHitPoints - target.statistics.hitPoints;
    const baseTime = 5 + Math.pow(points * 3, 5/4);

    return Math.max(3, Math.ceil(baseTime * ((110 - skill) / 100)));
  }

  evaluateHealCost(target) {
    const barter = game.playerParty.highestStatistic("barter");
    const points = target.statistics.maxHitPoints - target.statistics.hitPoints;
    const cost   = Math.pow(points * 0.3, 3/2);

    return this.baseCost + Math.ceil(Math.max(0, cost * ((125 - barter) / 100)));
  }

  evaluatePartyHealCost() {
    let result = 0;
    Array.from(game.playerParty.list).forEach(target => {
      result += this.evaluateHealCost(target);
    });
    return result;
  }
}
