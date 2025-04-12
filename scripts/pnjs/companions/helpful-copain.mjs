import {CompanionCharacter} from "../components/companion.mjs";

export default class extends CompanionCharacter {
  constructor(model) {
    super(model);
    this.dialog = "companions/helpful-copain";
    this.fallbackFaction = "hillburrow";
  }
}

