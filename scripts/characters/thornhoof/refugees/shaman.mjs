import Refugee from "./refugee.mjs";

export default class extends Refugee {
  constructor(model) {
    super(model);
    this.dialog = "thornhoof/refugees/shaman";
  }
}
