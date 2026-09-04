import {CompanionCharacter} from "../components/companion.mjs";

export default class Sheriff extends CompanionCharacter {
  constructor(model) {
    super(model);
    this.dialog = "companions/mercenary";
    this.fallbackFaction = "ash-aven";
  }
}
