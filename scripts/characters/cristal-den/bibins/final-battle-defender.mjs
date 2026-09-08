import {CharacterBehaviour} from "../../character.mjs";
import SeekAndDestroyComponent from "../../components/seekAndDestroy.mjs";
import {SquadFighterComponent} from "../../components/squadFighter.mjs";

export default class extends CharacterBehaviour {
  constructor(model) {
    super(model);
    this.squadFighter = new SquadFighterComponent(this);
    this.seekAndDestroy = new SeekAndDestroyComponent(this, this.findNextTarget.bind(this));
  }

  onLoaded() {
    this.seekAndDestroy.onLoaded();
  }

  initialize() {
    this.seekAndDestroy.enable();
  }

  get quest() {
    return game.quests.getQuest("cristal-den/bibins-final-battle");
  }

  get squad() {
    return this.quest.script.attackers;
  }

  get targetList() {
    const targets = this.quest.script.attackers.filter(defender => defender.isAlive());
    for (let i = 0 ; i < game.playerParty.list.length ; ++i)
      targets.push(game.playerParty.list[i]);
    return targets;
  }

  findNextTarget() {
    return this.targetList[0];
  }
}
