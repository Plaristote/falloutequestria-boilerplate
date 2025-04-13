import {CharacterBehaviour} from "../character.mjs";

const defaultTextBubbles = (function() {
  const result = [];
  for (let i = 1 ; i <= 5 ; ++i)
    result.push({ content: i18n.t(`bubbles.caravaneer-${i}`), duration: 2789});
  return result;
})();

export class Caravaneer extends CharacterBehaviour {
  constructor(model) {
    super(model);
    this.textBubbles = defaultTextBubbles;
  }
}
