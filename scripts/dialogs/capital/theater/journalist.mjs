class Dialog {
  constructor(dialog) {
    this.dialog = dialog;
  }

  getEntryPoint() {
    if (!this.dialog.npc.hasVariable("met")) {
      this.dialog.npc.setVariable("met", 1);
      this.firstTalk = true;
      return "introduction";
    }
    return "entry";
  }

  entry() {
    switch (this.dialog.previousAnswer) {
      case "smoothskin-sarcasm": return { textKey: "smoothskin-sarcasm-response", mood: "laugh" };
      case "smoothskin-dislike": return { textKey: "smoothskin-disgust-response", mood: "cocky" };
    }
  }

  leaveEntry() {
    if (this.firstTalk) return this.dialog.t("leave-entry-firsttime");
  }

  aboutTown() {
    switch (this.dialog.previousAnswer) {
      case "ask-population": return { textKey: "ash-aven-population" };
      case "ask-mutants":    return { textKey: "ash-aven-mutants" };
      case "ask-guarding":   return { textKey: "ash-aven-garde" };
    }
    return { textKey: "ash-aven-intro" };
  }

  aboutInvestigation() {
    switch (this.dialog.previousAnswer) {
      case "ask-investigation-inconsistencies": return { textKey: "investigation/inconsistencies", mood: "smile" };
      case "ask-investigation-discoveries":     return { textKey: "investigation/discoveries", mood: "neutral" };
      case "ask-investigation-suspicons":       return { textKey: "investigation/suspicions", mood: "cocky" };
      case "ask-investigation-interruption":    return { textKey: "investigation/interruption", mood: "sad" };
    }
    return { textKey: "investigation/intro", mood: "smile" };
  }

  onLeave() {
    if (this.firstTalk) return "visit-resons/intro";
  }
}

export function create(dialog) {
  return new Dialog(dialog);
}
