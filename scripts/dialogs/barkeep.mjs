import {MerchantHelper, makeOrderChoice} from "./merchant.mjs";

function onDrinkAlcohol() {
  game.asyncAdvanceTime(5, () => {
    this.dialog.player.addBuff("drunk");
  });
}

function orderBeverage(beverage) {
  this.firstDrink = false;
  this.orderConsumible(beverage);
  if (beverage.onConsume == "drunk")
    onDrinkAlcohol.bind(this)();
  return this.afterOrderDrink || "order-drink";
}

function makeBeverageChoice(self, beverage) {
  return makeOrderChoice(self, beverage, {
    type:     "drink",
    textHook: function() { return i18n.t(`barkeep.dialog-choices.order-${beverage.name}`) },
    hook:     orderBeverage
  });
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

  onConsume(type) {
    if (type == "drunk")
      return onDrinkAlcohol.bind(this)();
    return super.onConsume(type);
  }
}
