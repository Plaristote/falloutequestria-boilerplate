import {GuardBehaviour} from "../guard.mjs";
import {GuardComponent} from "../components/guard.mjs";

export class Guard extends GuardBehaviour {
  constructor(model) {
    super(model);
    this.guardComponent = new GuardComponent(this);
  }
}
