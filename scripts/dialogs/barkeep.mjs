import {MerchantHelper} from "./merchant.mjs";

function upcaseFirstLetter(name) {
  return name[0].toUpperCase() + name.slice(1);
}

function onDrinkAlcohol() {
  game.asyncAdvanceTime(5, () => {
    this.dialog.player.addBuff("drunk");
  });
}

function canOrderBeverage(beverage) {
  return this.canBuy(beverage.price);
}

function orderBeverage(beverage) {
  this.firstDrink = false;
  this.spendMoney(beverage.price);
  if (typeof beverage.onDrink == "function")
    beverage.onDrink();
  else if (beverage.onDrink == "drunk")
    onDrinkAlcohol.bind(this)();
  else
    game.asyncAdvanceTime(1);
  return this.afterOrderDrink || "order-drink";
}

function makeBeverageChoice(self, beverage) {
  return {
    symbol:        `order-drink-${beverage.name}`,
    textHook:      function() { return i18n.t(`barkeep.dialog-choices.order-${beverage.name}`) },
    availableHook: canOrderBeverage.bind(self, beverage),
    hook:          orderBeverage.bind(self, beverage)
  };
}

function addBeverage(beverage) {
  this[`${beverage.name}Price`] = beverage.price || this.getPriceWithDiscount(5);
  this.beverageChoices.push(makeBeverageChoice(this, beverage));
}

export class BarkeepHelper extends MerchantHelper {
  constructor(dialog, beverages) {
    super(dialog);
    this.beverageChoices = [];
    beverages.forEach(addBeverage.bind(this));
    this.beverageChoices.push("exit-without-drinks")
  }

  openDrink() {
    this.firstDrink = true;
  }

  barDialog() {
    return {
      text: this.dialog.t(this.firstDrink ? "order-drink" : "order-drink-alt"),
      answers: this.beverageChoices
    };
  }
}
