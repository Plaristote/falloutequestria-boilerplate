import {CharacterBehaviour} from "../character.mjs";
import {requireQuest} from "../../quests/helpers.mjs";

const deathDelay = 1036800;

export class HelpfulCopainDisappeared extends CharacterBehaviour {
  constructor(model) {
    super(model);
  }

  get dialog() {
    return this.followsPlayer ? null : "junkville/helpful-copain-disappeared";
  }

  get textBubbles() {
    return [
      {content: i18n.t("junkville.helpful.lets-go"), duration: 3000, color: "cyan" },
      {content: i18n.t("junkville.helpful.hurt"),    duration: 3000, color: "cyan" }
    ]
  }

  get followsPlayer() {
    return this.model.tasks.hasTask("followPlayer");
  }

  get hasSlint() {
    return this.model.hasVariable("slint-crafted");
  }

  initialize() {
    this.model.tasks.addTask("deathTimeout", deathDelay * 1000, 1);
    this.model.setAnimation("fall");
  }

  deathTimeout() {
    this.model.takeDamage(100, null);
  }

  getAvailableInteractions() {
    this.canPush = this.hasSlint;
    return super.getAvailableInteractions();
  }

  onLook() {
    if (!this.hasSlint) {
      const quest = requireQuest("junkville/findHelpful");
      quest.completeObjective("find-helpful");
      game.appendToConsole("junkville.helpful.look-at");
      return true;
    }
    return super.onLook();
  }

  onTurnStart() {
    if (this.hasSlint)
      super.onTurnStart();
    else
      level.passTurn(this.model);
  }

  onDied() {
    const quest = requireQuest("junkville/findHelpful");
    quest.setVariable("died", 1);
    super.onDied();
  }
}
