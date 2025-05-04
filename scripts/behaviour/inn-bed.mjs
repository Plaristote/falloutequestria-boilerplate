function restChoices(secondsAvailable, callback) {
  let choices = [];
  let durations = [
    ["1h",  60*60],
    ["6h",  60*60*6],
    ["9h",  60*60*9],
    ["12h", 60*60*12],
    ["24h", 60*60*24]
  ];

  durations.forEach(function(data) {
    const choice = data[0];
    const duration = data[1];
    if (secondsAvailable === "infinite" || duration <= secondsAvailable) {
      const time = game.timeManager.toStringAfter(duration, "%w %h:%m");
      choices.push({
        label: i18n.t(`innkeep.restChoices.${choice}`) + "<br>" + i18n.t("innkeep.restChoices.suffix", { time }),
        callback: function() { callback(duration); }
      });
    }
  });
  choices.push({ label: i18n.t("innkeep.restChoices.exit") });
  return choices;
}

export default class {
  constructor(model) {
    this.model = model;
  }

  get roomNumber() {
    return parseInt(this.room.name.split('#')[1]);
  }

  get room() {
    return this.model.parent;
  }

  get inn() {
    let parent = this.room.parent;
    while (parent && !parent.script)
      parent = parent.parent;
    return parent;
  }

  getAvailableInteractions() {
    return ["use", "look"];
  }

  isRentedByPlayer() {
    return this.inn.script.getRentedRoom() == this.room;
  }

  hasInnkeeper() {
    return this.inn.script.innkeeper && this.inn.script.innkeeper.isAlive();
  }

  sleepFor(seconds) {
    game.player.setVariable("resting", true);
    game.asyncAdvanceTime(seconds / 60, function() {
      game.player.setVariable("resting", false);
      game.appendToConsole(i18n.t("innkeep.on-bed-rest"));
      game.player.addBuff("rested").script.charges = Math.floor(seconds / 60 / 60);
    });
  }

  onUse() {
    if (this.isRentedByPlayer() || !this.hasInnkeeper()) {
      const secondsLeft = this.hasInnkeeper() ? this.inn.script.rentSecondsLeft : "infinite";
      const choices = restChoices(secondsLeft, this.sleepFor.bind(this));
      game.openPrompt(i18n.t("innkeep.rest-prompt"), choices);
      return true;
    } else {
      game.appendToConsole(i18n.t("innkeep.not-your-bed"));
    }
    return false;
  }
}
