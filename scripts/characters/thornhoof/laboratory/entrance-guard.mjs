import {CharacterBehaviour} from "./../../character.mjs";

class EntranceGuard extends CharacterBehaviour {
  constructor(model) {
    super(model);
    this.dialog = "thornhoof/laboratory/entrance-guard";
  }

  get speakOnDetection() {
    return true; // this should be altered by some stuff
  }

  dialogDetectionHook() {
    if (super.dialogDetectionHook()) {
      this.intercepting = true;
      return true;
    }
    return false;
  }
}

export function create(model) {
  return new EntranceGuard(model);
}
