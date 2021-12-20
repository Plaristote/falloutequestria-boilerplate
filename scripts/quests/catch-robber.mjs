import {QuestHelper} from "./helpers.mjs";
import {SceneManager} from "../behaviour/sceneManager.mjs";

class QuestioningScene extends SceneManager {
  constructor(parent) {
    super(parent, "cs-questioning");
  }

  onCombatTurn(character) {
    this.triggerFight();
  }

  onDamageTaken(character, dealer) {
    if (character.path !== "passerby.passerby#5" || dealer === game.player)
      this.triggerFight();
  }

  get actors() {
    return [
      level.findObject("casino.director"),
      level.findObject("casino.director-bodyguard"),
      level.findObject("passerby.passerby#5")
    ];
  }

  get states() {
    return [
      this.questioningStepIntro.bind(this),
      this.questioningStepBodyguard1.bind(this),
      this.questioningStepDirector1.bind(this),
      this.questioningStepBodyguard2.bind(this),
      this.questioningStepDirector2.bind(this),
      this.questioningStepBodyguardKill.bind(this),
      this.questioningEnd.bind(this)
    ];
  }

  questioningLines() {
    return [
      this.model.tr("director-scene.part1"),
      this.model.tr("director-scene.part1-1"),
      this.model.tr("director-scene.part2"),
      this.model.tr("director-scene.part3"),
      this.model.tr("director-scene.part4"),
      this.model.tr("director-scene.part5"),
      this.model.tr("director-scene.part6"),
      this.model.tr("director-scene.part7"),
      this.model.tr("director-scene.part8"),
      this.model.tr("director-scene.part9"),
      this.model.tr("director-scene.part10"),
      this.model.tr("director-scene.part11"),
      this.model.tr("director-scene.part12"),
      this.model.tr("director-scene.part13"),
      this.model.tr("director-scene.part14")
    ];
  }

  initialize() {
    const director  = level.findObject("casino.director");
    const robber    = level.findObject("passerby.passerby#5");
    const bodyguard = level.findObject("casino.director-bodyguard");
    const directorOffice = level.findGroup("casino.director-office");

    [director, robber, bodyguard, game.player].forEach(character => {
      if (character.isAlive() && !character.isInZone(directorOffice.controlZone))
        level.moveCharacterToZone(character, directorOffice.controlZone);
    });
    director.lookAt(robber);
    robber.lookAt(director);
    level.cameraFocusRequired(director);
    this.model.completeObjective("bring");
    super.initialize();
  }

  questioningStepIntro() {
    const director    = level.findObject("casino.director");
    const robber      = level.findObject("passerby.passerby#5");
    const endCallback = this.triggerNextStep.bind(this);
    const lines       = this.questioningLines();

    director.actionQueue.pushSpeak(lines[0], 6000, "yellow"); // Intro 1
    director.actionQueue.pushWait(6);
    director.actionQueue.pushSpeak(lines[2], 6000, "yellow"); // Intro 2
    director.actionQueue.pushScript(function() {
      level.addTextBubble(robber, lines[1], 2500, "white"); // Robber reaction to Intro 1
    });
    director.actionQueue.pushWait(6);
    director.actionQueue.pushSpeak(lines[3], 6000, "yellow"); // Questioning 1
    director.actionQueue.pushWait(4);
    director.actionQueue.pushScript(function() {
      level.addTextBubble(robber, lines[4], 5000, "red"); // Response 1
    });
    director.actionQueue.pushWait(4);
    director.actionQueue.pushSpeak(lines[5], 3000, "yellow"); // Questioning 2
    director.actionQueue.pushWait(1);
    director.actionQueue.pushScript(endCallback);
    director.actionQueue.start();
  }

  questioningStepBodyguard1() {
    const robber      = level.findObject("passerby.passerby#5");
    const bodyguard   = level.findObject("casino.director-bodyguard");
    const endCallback = this.triggerNextStep.bind(this);
    const lines       = this.questioningLines();

    bodyguard.actionQueue.pushReach(robber);
    bodyguard.actionQueue.pushInteraction(robber, "use");
    bodyguard.actionQueue.pushScript(function() {
      robber.takeDamage(6, null);
      level.addTextBubble(robber, lines[6], 2000, "red"); // Pain reaction 1
    });
    bodyguard.actionQueue.pushInteraction(robber, "use");
    bodyguard.actionQueue.pushScript(function() {
      robber.takeDamage(6, null);
      level.addTextBubble(robber, lines[7], 2000, "red"); // Pain reaction 2
      endCallback();
    });
    bodyguard.actionQueue.start();
  }

  questioningStepDirector1() {
    const director    = level.findObject("casino.director");
    const robber      = level.findObject("passerby.passerby#5");
    const endCallback = this.triggerNextStep.bind(this);
    const lines       = this.questioningLines();

    director.actionQueue.pushWait(1);
    director.actionQueue.pushSpeak(lines[8], 3500, "yellow"); // Questioning 3
    director.actionQueue.pushWait(3);
    director.actionQueue.pushScript(function() {
      level.addTextBubble(robber, lines[9], 2700, "red"); // Response 2
    });
    director.actionQueue.pushWait(1);
    director.actionQueue.pushSpeak(lines[10], 3500, "yellow"); // Questioning 4
    director.actionQueue.pushWait(1);
    director.actionQueue.pushScript(endCallback);
    director.actionQueue.start();
  }

  questioningStepBodyguard2() {
    const robber      = level.findObject("passerby.passerby#5");
    const bodyguard   = level.findObject("casino.director-bodyguard");
    const endCallback = this.triggerNextStep.bind(this);
    const lines       = this.questioningLines();

    bodyguard.actionQueue.pushReach(robber);
    bodyguard.actionQueue.pushInteraction(robber, "use");
    bodyguard.actionQueue.pushScript(function() {
      robber.takeDamage(6, null);
      level.addTextBubble(robber, lines[11], "red"); // Pain reaction 3
      endCallback();
    });
    bodyguard.actionQueue.start();
  }

  questioningStepDirector2() {
    const director    = level.findObject("casino.director");
    const robber      = level.findObject("passerby.passerby#5");
    const bodyguard   = level.findObject("casino.director-bodyguard");
    const endCallback = this.triggerNextStep.bind(this);
    const lines       = this.questioningLines();

    director.actionQueue.pushWait(1);
    director.actionQueue.pushSpeak(lines[12], 6500, "yellow");
    director.actionQueue.pushWait(5);
    director.actionQueue.pushScript(function() {
      level.addTextBubble(robber, lines[13], 3500, "red"); // Last response
    });
    director.actionQueue.pushWait(3);
    director.actionQueue.pushSpeak(lines[14], 5250, "yellow");
    director.actionQueue.pushWait(1);
    director.actionQueue.pushScript(endCallback);
    director.actionQueue.start();
  }

  questioningStepBodyguardKill() {
    const robber      = level.findObject("passerby.passerby#5");
    const bodyguard   = level.findObject("casino.director-bodyguard");
    const endCallback = this.triggerNextStep.bind(this);
    const lines       = this.questioningLines();

    bodyguard.actionQueue.pushReach(robber);
    bodyguard.actionQueue.pushInteraction(robber, "use");
    bodyguard.actionQueue.pushScript(function() {
      robber.takeDamage(999, null);
    });
    bodyguard.actionQueue.pushWait(2);
    bodyguard.actionQueue.pushScript(endCallback);
    bodyguard.actionQueue.start();
  }

  questioningEnd() {
    const director  = level.findObject("casino.director");
    const robber    = level.findObject("passerby.passerby#5");
    const bodyguard = level.findObject("casino.director-bodyguard");

    level.initializeDialog(director, "town-hotel-owner-pickpocket-done");
    [director, robber, bodyguard].forEach(character => {
      toggleRoutine(character, true);
    });
    this.finalize();
  }

  triggerFight() {
    const director = level.findObject("casino.director");
    const robber   = level.findObject("passerby.passerby#5");

    level.addTextBubble(director,
      "What a disapointment... guards, kill them all.", 5000, "red"
    );
    robber.setVariable("escaping", true);
    robber.statistics.faction = "";
    director.setAsEnemy(level.player);
    director.setAsEnemy(robber);
    this.actors.forEach(actor => level.joinCombat(actor));
    this.finalize();
  }
}

class CatchRobber extends QuestHelper {
  initialize() {
    this.model.location = "city-sample";
    this.onLevelChanged();
  }

  getObjectives() {
    const array = [
      {
        label:   this.tr("find-robber"),
        success: this.isObjectiveCompleted("find"),
        failed:  this.model.hasVariable("escaped")
      },
      {
        label:   this.tr("bring-robber"),
        success: this.isObjectiveCompleted("bring"),
        failed:  this.isObjectiveCompleted("help-escape")
      }
    ];

    if (this.isObjectiveCompleted("help-escape"))
      array.push({ label: this.tr("help-escape"), success: true });
    if (this.isObjectiveCompleted("kill-robber"))
      array.push({ label: this.tr("kill"), success: true });
    return array;
  }

  onLevelChanged() {
    if (level.name === this.model.location)
      this.questioningScene = new QuestioningScene(this);
    else
      delete this.questioningScene;
  }

  onCharacterKilled(victim, killer) {
    if (victim.path === "passerby.passerby#5") {
      this.model.completeObjective("kill-robber");
      this.model.completed = true;
    }
  }

  onCompleted() {
    var xp = 750;

    if (this.isObjectiveCompleted("bring"))
      xp += 250;
    game.appendToConsole(i18n.t("messages.quest-complete", {
      title: this.tr("title"),
      xp:    xp
    }));
    game.player.statistics.addExperience(xp);
    ["city-sample","mordino"].forEach(faction => {
      game.dataEngine.addReputation(faction, 30);
    });
  }

  startRobberNpcDialog() {
    this.questioningScene.initialize();
  }
}

export function create(model) {
  return new CatchRobber(model);
}
