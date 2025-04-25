import {LevelBase} from "./base.mjs";

export default class extends LevelBase {
  popOutCaravanFromCity() {
    if (game.quests.getQuest("thornhoof/caravan")?.script?.caravanInProgress)
      return ;
    super.popOutCaravanFromCity();
  }
}

