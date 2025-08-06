const blueprintSuffix = "-blueprints";

export function makeCraftChoice(self, itemType) {
  return {
    symbol:   `craft-item-${itemType}`,
    textHook: function() { return i18n.t(`items.${itemType}`) },
    hook:     self.craftAppraise.bind(self, itemType)
  };
}

function makeCraftChoiceFromBlueprint(self, item) {
  const itemType = item.itemType.replace(blueprintSuffix, "");
  return makeCraftChoice(self, itemType);
}

function makeCraftChoices(self, dialog) {
  const choices = [];
  for (let i = 0 ; i < game.player.inventory.items.length ; ++i) {
    const item = game.player.inventory.items[i];
    if (item.itemType.indexOf(blueprintSuffix) >= 0) {
      if (self.canCraft && self.canCraft(item))
        choices.push(makeCraftChoiceFromBlueprint(self, item));
    }
  }
  return choices;
}

export default class CrafterComponent {
  constructor(self, choices = []) {
    this.self = self;
    this.dialog = self.dialog;
    this.choices = choices;
    if (!self.craftAppraise)
      self.craftAppraise = this.defaultCraftAppraise.bind(this);
    if (!self.craftDialog)
      self.craftDialog = this.defaultCraftDialog.bind(this);
  }

  get craftChoices() {
    return makeCraftChoices(this.self, this.dialog, this.choices);
  }

  get craftPrompt() {
    const answers = this.craftChoices;
    answers.push("exit-without-craft");
    return {
      text: this.dialog.t("craft-prompt"),
      answers: answers
    };
  }

  appraiseCraft(itemType) {
    const skill = this.dialog.npc.statistics.barter;
    const contestantSkill = game.player.statistics.barter;
    const diff = skill - contestantSkill;
    const value = itemLibrary.getValue(itemType);
    const base = Math.floor(value * 0.8);
    const complement = (value * 0.4) * (diff / 100);
    return Math.floor(base + Math.max(-base / 2, complement));
  }

  appraiseCraftTime(itemType, cost) {
    return Math.ceil(Math.pow(cost / 35, 2) * 60);
  }

  defaultCraftDialog() {
    return this.craftPrompt;
  }

  defaultCraftAppraise(itemType) {
    const cost = this.appraiseCraft(itemType);
    const availableMoney = game.player.inventory.count("bottlecaps");

    return {
      text: this.dialog.t("craft-item-cash", { cost: cost, item: i18n.t(`items.${itemType}`) }),
      answers: [
        {
          symbol: `craft-item-${itemType}-cashing`,
          text: "craft-pay-up",
          hook: this.defaultCraftItem.bind(this, itemType, cost),
          availableHook: function() { return cost <= availableMoney; }
        },
        "cannot-afford-craft"
      ]
    };
  }

  defaultCraftItem(itemType, cost) {
    game.asyncAdvanceTime(this.appraiseCraftTime(itemType, cost));
    game.player.inventory.removeItemOfType("bottlecaps", cost);
    game.player.inventory.addItemOfType(itemType);
    this.craftedItemName = i18n.t(`items.${itemType}`);
    return "craft-ended";
  }
}
