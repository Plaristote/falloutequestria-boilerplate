import {Shop} from "../shop.mjs"

export default class extends Shop {
  get shopDoors() {
    return [
      this.model.findObject("door")
    ];
  }

  get shopShelfs() {
    return [
      this.model.findObject("shelf#1"),
      this.model.findObject("shelf#2")
    ];
  }
}
