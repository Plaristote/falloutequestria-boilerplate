import HealerComponent from "../healer.mjs";

class Dialog {
  constructor(dialog) {
    this.dialog = dialog;
    this.healer = new HealerComponent(this);
    this.healer.makeCashPromptText = function(target, cost) {
      if (target === game.playerParty)
        return dialog.t("cash-prompt-party", { cost: cost });
      return dialog.t("cash-prompt", { cost: cost })
    }
  }

  healPrompt() {
    return this.healer.healPrompt();
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
