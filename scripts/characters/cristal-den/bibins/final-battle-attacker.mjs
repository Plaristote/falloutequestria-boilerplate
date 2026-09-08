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
    const extras = this.quest.script.defenders.filter(defender => defender.isAlive());
    const guards1 = level.findGroup("hostel.guards.floor-0").objects.filter(guard => guard.isAlive());
    const guards2 = level.findGroup("hostel.guards.floor-1").objects.filter(guard => guard.isAlive());
    return extras.concat(guards1).concat(guards2);
  }

  findNextTarget() {
    const bibin = level.findObject("hostel.bibins-room.bibin");
    const targets = this.targetList;

    return targets.length > 0 ? targets[0] : bibin;
  }
}
