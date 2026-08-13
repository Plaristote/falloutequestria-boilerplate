import {Innkeeper} from "../innkeeper.mjs";
import {isPlayerLookingForWaterCarrier} from "../../quests/cristal-den/bibins-sabotage-delivery.mjs";

export default class extends Innkeeper {
  canAskAboutWaterCarrier() {
    return isPlayerLookingForWaterCarrier();
  }
}
