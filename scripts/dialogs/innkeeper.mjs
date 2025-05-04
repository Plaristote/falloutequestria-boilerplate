import {MerchantHelper} from "./merchant.mjs";

const prices = {
  "night": 15,
  "week": 75
};

function priceForUser(choice, user) {
  return Math.ceil(prices[choice] - prices[choice] * (user.statistics.barter / 200));
}

export class Innkeeper extends MerchantHelper {
  constructor(dialog) {
    super(dialog);
  }

  get nightRent() {
    return priceForUser("night", this.dialog.player);
  }

  get weekRent() {
    return priceForUser("week", this.dialog.player);
  }

  get inn() {
    return this.dialog.npc.script.inn || this.dialog.npc.parent;
  }

  get rentedRoomNumber() {
    return this.inn.script.rentedRoomNumber;
  }

  canRent(choice) {
    return this.canBuy(priceForUser(choice, this.dialog.player));
  }

  showRentedRoom() {
    this.inn.script.showRentedRoom(this.dialog.npc);
  }

  buy(choice) {
    const price = priceForUser(choice, this.dialog.player);
    const roomNumber = this.inn.script.getRandomRoom();
    let durationInSeconds;
    let duration = { "hour": 9 };

    if (game.timeManager.hour > 2 && game.timeManager.hour < 9)
      duration.days = 1;
    if (choice === "weeks")
      duration.weeks = 1;
    durationInSeconds = game.timeManager.secondsUntilTime(duration);
    this.inn.script.rentRoom(roomNumber, durationInSeconds * 1000);
    this.spendMoney(price);
    return this.innDialogFollowup();
  }

  innDialogFollowup() {
    console.log("Generating innDialogFollowup");
    return {
      text: this.dialog.tWithFallback("innDialog-followup", {}, i18n.t("innkeep.dialog.followup", { rentedRoomNumber: this.rentedRoomNumber })),
      answers: [
        {
          symbol: "escort-to-room",
          textHook: function() { return i18n.t("innkeep.dialog-choices.show-room"); },
          hook: this.showRentedRoom.bind(this)
        },
        {
          symbol: "no-escort-to-room",
          textHook: function() { return i18n.t("innkeep.dialog-choices.dont-show-room"); }
        }
      ]
    };
  }

  innDialog() {
    const offerParams = { nightRent: this.nightRent, weekRent: this.weekRent };

    if (this.rentedRoomNumber)
      return i18n.t("innkeep.dialog.alreadyHasRoom", { roomNumber: this.rentedRoomNumber });
    return {
      text: this.dialog.tWithFallback("innDialog", {}, i18n.t("innkeep.dialog.entry", offerParams)),
      answers: [
        {
          symbol: "order-room-night",
          textHook: function() { return i18n.t("innkeep.dialog-choices.order-night") },
          availableHook: this.canRent("night"),
          hook: this.buy.bind(this, "night")
        },
        {
          symbol: "order-room-week",
          textHook: function() { return i18n.t("innkeep.dialog-choices.order-week") },
          availableHook: this.canRent("week"),
          hook: this.buy.bind(this, "week")
        },
        {
          symbol: "exit",
          textHook: function() { return i18n.t("innkeep.dialog-choices.exit-without-room") }
        }
      ]
    };
  }
}
