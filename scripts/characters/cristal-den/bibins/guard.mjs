import {GuardBehaviour} from "../../guard.mjs";
import {GuardComponent} from "../../components/guard.mjs"

export class Guard extends GuardBehaviour {
  constructor(parent) {
    super(parent);
    this.guardComponent = new GuardComponent(this);
  }

  get cellRoom() {
    return level.findGroup("hostel.cell-room");
  }

  onCharacterDetected(character) {
    super.onCharacterDetected(character);
    if (character == game.player && level.isInsideZone(this.cellRoom.controlZone, character)) {
      if (this.model.isEnemy(character))
        return ;
      level.addTextBubble(this.model, i18n.t("cristal-den-slum-bubbles.bibin-trespassing"), 3500, "red");
      this.model.setAsEnemy(character);
      this.model.fieldOfView.setEnemyDetected(character);
    }
    if (character.characterSheet === "cristal-den/bibins/potiok-spy") {
      if (this.model.isEnemy(character) || level.isInsideZone(this.cellRoom.controlZone, character))
        return ;
      level.addTextBubble(this.model, i18n.t("cristal-den-slum-bubbles.bibin-guard-prisoner-escaping"), 3250, "red");
      this.model.setAsEnemy(character);
      this.model.fieldOfView.setEnemyDetected(character);
    }
  }
}
