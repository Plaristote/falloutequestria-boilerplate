import {Shop} from "../shop.mjs";

export default class extends Shop {
  get shopOwner() {
    return level.findObject("clinic.doctor");
  }
}
