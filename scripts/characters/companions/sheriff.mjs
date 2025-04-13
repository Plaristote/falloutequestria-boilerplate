import {CompanionCharacter} from "../components/companion.mjs";

export class Sheriff extends CompanionCharacter {
  constructor(model) {
    super(model);
    this.dialog = "companions/sheriff";
    this.fallbackFaction = "hillburrow";
  }
}

export function create(model) {
  return new Sheriff(model);
}
