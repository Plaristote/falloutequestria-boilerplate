import {PackMember} from "./pack-member.mjs";
import {GuardComponent} from "../components/guard.mjs";

export class DogGuard extends PackMember {
  constructor(model) {
    super(model);
    this.guardComponent = new GuardComponent(this);
  }

  get dialog() {
    return !this.model.getVariable("met") ? "junkville/guard-dog" : null;
  }

  get speakOnDetection() {
    return this.model.getVariable("met") !== true;
  }

  investigatePlayerFall() {
    this.model.actionQueue.pushReach(game.player, 5);
    this.model.actionQueue.pushWait(5);
    this.model.actionQueue.start();
  }
}
