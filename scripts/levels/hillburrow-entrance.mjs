import {Hillburrow} from "./hillburrow.mjs";

export class HillburrowEntrance extends Hillburrow {
  onExit() {
    const sheriff = level.find(object => object.characterSheet == "hillburrow/sheriff");

    if (sheriff.length > 0 && sheriff[0].tasks.hasTask("offscreenVengeance"))
      sheriff[0].script.finalizeOffscreenVengeance();
  }
}
