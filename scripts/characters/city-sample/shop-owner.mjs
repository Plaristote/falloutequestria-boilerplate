import {CharacterBehaviour} from "../character.mjs";
import {callGuards, AlarmLevel} from "../components/alarm.mjs";

const fearReactions = (function() {
  const list = [];
  for (let i = 1 ; i <= 5 ; ++i)
    list.push({text: i18n.t(`bubbles.fear-reaction-${i}`), time: 2000, color: "yellow"});
  return list;
})();

export class ShopOwner extends CharacterBehaviour {
  constructor(model) {
    super(model);
    this.model.morale = 0;
    this.dialog = "town-trader";
  }

  onDamageTaken(amount, dealer) {
    super.onDamageTaken(amount, dealer);
    if (dealer) {
      const reactionIt = Math.floor(Math.random() * 100) % fearReactions.length;
      const reaction = fearReactions[reactionIt];
      callGuards(level.findGroup("guards"), dealer, AlarmLevel.ShootOnSight);
      console.log("Reaction", reactionIt, reaction);
      level.addTextBubble(this.model, reaction.text, reaction.time, reaction.color);
    }
  }

  get shop() {
    const group = this.model.parent.findGroup("shop");
    return group ? group : this.model.parent;
  }

  get bed() {
    return this.model.parent.findObject("bedroom.bed");
  }

  isAtHome() {
    return this.model.parent.findGroup("bedroom").controlZone.isInside(
      this.model.position.x, this.model.position.y, this.model.floor
    );
  }

  onCharacterDetected(character) {
    const script = this.shop ? this.shop.getScriptObject() : null;

    if (script && !script.opened && script.shopOccupants().indexOf(character) >= 0) {
      level.addTextBubble(this.model, i18n.t("bubbles.shop-closed"), 2000, "orange");
      callGuards(level.findGroup("guards"), character, AlarmLevel.Arrest);
    }
    else
      super.onCharacterDetected();
  }
}

export function create(model) {
  return new ShopOwner(model);
}
