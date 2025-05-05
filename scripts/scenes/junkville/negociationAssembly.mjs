import {SceneManager} from "../../behaviour/sceneManager.mjs";
import {requireQuest} from "../../quests/helpers.mjs";
import {skillCheck, skillContest} from "../../cmap/helpers/checks.mjs"

export const opinionVarName =  "negociationAssemblyOpinion";

export default class NegociationAssembly extends SceneManager {
  constructor(parent) {
    super(parent, "negociation-assembly");
    this.generateActors();
    this.xpStorageScope = this.storageScope + '-xp';
  }

  get actors() {
    if (!this._actors)
      this._actors = this.generateActors();
    return this._actors;
  }

  get assemblyZone() {
    return level.getTileZone("ekklesia");
  }

  get states() {
    return this.generateSteps();
  }

  get influenceXp() {
    return this.model.getVariable(this.xpStorageScope, 0);
  }

  set influenceXp(value) {
    this.model.setVariable(this.xpStorageScope, value);
  }

  initialize() {
    super.initialize();
    this.actors.forEach(actor => {
      if (!actor.hasVariable(opinionVarName))
        actor.setVariable(opinionVarName, 0);
    });
  }

  finalize() {
    level.setVariable("nextAssemblyEnd", 0);
    super.finalize();
  }

  generateActors() {
    return level.getZoneOccupants(this.assemblyZone).filter(character => {
      return character.type == "Character" && character.statistics.faction == "junkville"
    });
  }

  generateSteps() {
    const list = [];

    for (let debateStep = 1 ; debateStep < 4 ; ++debateStep) {
      list.push(this.introduceStepState.bind(this, debateStep));
      this.actors.forEach(actor => {
        list.push(this.debateLineState(debateStep, actor));
      });
      list.push(this.choiceState(debateStep));
    }
    this.actors.forEach(actor => {
      list.push(this.debateLineState(4, actor));
    });
    list.push(this.conclusionState.bind(this));
    list.push(this.finalize.bind(this));
    return list;
  }

  onLevelExit() {
    // TODO take decision immediately and end this ?
  }

  lineState(character, line, duration) {
    return this.dialogLineStep.bind(this, {
      speaker:        character,
      towards:        { x: 32, y: 10 },
      line:           line,
      bubbleDuration: duration * 1.8,
      duration:       duration
    });
  }

  introduceStepState(debateStep) {
    let mediator = level.findObject("cook");
    if (!mediator || mediator.unconscious) {
      mediator = this.actors.filter(character => !character.unconscious)[0];
    }
    if (mediator) {
      this.lineState(mediator, this.line(`step${debateStep}-introduction`), 4)();
    } else {
      this.triggerNextStep();
    }
  }

  debateLineState(debateStep, character) {
    return this.lineState(
      character,
      this.pickLine(debateStep, character),
      3.2
    );
  }

  choiceState(debateStep) {
    const zone = this.assemblyZone;
    const fallback = this.triggerNextStep.bind(this);
    const callback = this.openPromptStep.bind(this, this.line("player-choice"), [
      { label: this.line("player-choice-peace"),    callback: this.choseEncouragePeace.bind(this, debateStep) },
      { label: this.line("player-choice-violence"), callback: this.choseEncourageViolence.bind(this, debateStep) },
      { label: this.line("player-stay-silent"),     callback: this.choseSilence.bind(this, debateStep) }
    ]);
    return function() {
      if (game.player.isInZone(zone))
        callback();
      else
        fallback();
    };
  }

  conclusionState() {
    const mediator = level.findObject("cook");
    const result = this.debateResult();
    const quest = requireQuest("junkvilleNegociateWithDogs");

    quest.setVariable("junkvilleDecision", result);
    if (game.player.isInZone(this.assemblyZone))
      quest.completeObjective("assembly-participate");
    if (this.influenceXp > 0) {
      game.playerParty.addExperience(this.influenceXp);
      game.appendToConsole(this.line("xp-gain", { xp: this.influenceXp }));
      this.model.unsetVariable(this.xpStorageScope);
    }
    if (mediator) {
      this.dialogLineStep({
        speaker: mediator,
        towards: { x: 32, y: 10 },
        line: this.line("conclusion-line-" + result),
        duration: 5000
      });
    } else {
      this.triggerNextStep();
    }
  }

  autoConclude(participants) {
    const result = this.debateResult(participants);
    const quest = requireQuest("junkvilleNegociateWithDogs");
    quest.setVariable("junkvilleDecision", result);
  }

  pickLine(debateStep, actor) {
    const opinion = actor.getVariable(opinionVarName);
    const suffix = `debate-line-step${debateStep}-${actor.objectName}`

    if (opinion == 0)
      return this.line("skeptical-" + suffix);
    else if (opinion > 0)
      return this.line("agreeable-" + suffix);
    return this.line("angry-" + suffix);
  }

  choseEncouragePeace(debateStep) {
    if (skillCheck(game.player, "speech")) {
      level.addTextBubble(game.player, this.line(`player-choice-peace-${debateStep}-success`), 5000, "lightgreen");
      this.influenceChallenge(1, 2);
    } else {
      level.addTextBubble(game.player, this.line(`player-choice-peace-${debateStep}-failure`), 5000, "lightgreen");
      this.influenceChallenge(-1);
    }
  }

  choseEncourageViolence(debateStep) {
    if (skillCheck(game.player, "speech")) {
      level.addTextBubble(game.player, this.line(`player-choice-violence-${debateStep}-success`), 5000, "lightgreen");
      this.influenceChallenge(-1, 2);
    } else {
      level.addTextBubble(game.player, this.line(`player-choice-violence-${debateStep}-failure`), 5000, "lightgreen");
      this.influenceChallenge(0);
    }
  }

  choseSilence() {}

  influenceChallenge(direction, bonus) {
    this.actors.forEach(actor => {
      const opinion = actor.getVariable(opinionVarName);
      const winner = skillContest({ character: game.player, bonus: bonus }, actor, "charisma", 4);

      if (winner == game.player) {
        console.log("INFLUENCE CHALLENGE: player influenced", actor.displayName);
        actor.setVariable(opinionVarName, opinion + direction);
        game.dataEngine.addReputation("junkville", 5);
        this.influenceXp += 3;
      } else {
        console.log("INFLUENCE CHALLENGE: player failed to influence", actor.displayName);
        game.dataEngine.addReputation("junkville", -5);
      }
    });
  }

  debateResult(participants) {
    let warScore = 0;
    let neutralScore = 0;
    let acceptScore = 0;

    if (!participants) participants = this.actors;
    participants.forEach(actor => {
      const opinion = actor.getVariable(opinionVarName);
      if (opinion > 0) acceptScore++;
      else if (opinion < 0) warScore++;
      else neutralScore++;
    });
    if (acceptScore > neutralScore + warScore)
      return 'accept';
    if (warScore > neutralScore + warScore)
      return 'war';
    return 'reject';
  }
}
