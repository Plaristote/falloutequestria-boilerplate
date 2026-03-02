class Dialog {
  constructor(dialog) {
    this.dialog = dialog;
  }

  jailPrompt() {
    switch (this.previousAnswer) {
    case "ask-about-self":
      return { textKey: "jailed/reactions-about-self" };
    case "ask-about-motives":
      return { textKey: "jailed/reactions-about-motives" };
    case "ask-about-stuff":
      return { textKey: "jailed/let-out-prompt" };
    case "ask-let-out-insist":
      return { textKey: "jailed/reactions-asked-nicely" };
    case "ask-let-out-offer-friendship":
      return { textKey: "jailed/reactions-friendship" };
    case "ask-let-out-reason":
      return { textKey: "jailed/reactions-reason" };
    case "let-out-offer-sex":
      return { textKey: "jailed/reactions-about-sex" };
    case "let-out-ask-equality":
      return { textKey: "jailed/reactions-equality" };
    }
  }

  goToQueen() {
    level.setVariable("guardSentPlayerToQueen", 1);
    level.script.freePlayerFromJail();
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
