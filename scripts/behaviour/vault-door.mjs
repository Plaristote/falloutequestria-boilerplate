import {AutoClosingDoor} from "./door-auto-close.mjs";

export class VaultDoor extends AutoClosingDoor {
  constructor(model) {
    super(model);
    this.model.openSound   = "vault/door-open";
    this.model.closeSound  = "vault/door-close";
    this.model.lockedSound = "vault";
  }
}
