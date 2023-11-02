import {QuestHelper} from "./helpers.mjs";
import {SceneManager} from "../behaviour/sceneManager.mjs";

class MordinoScene extends SceneManager {
  constructor(parent) {
    super(parent, "cs-mordino");
  }

  get actors() {
    return [
      level.findObject("casino.director"),
      level.findObject("casino.guards.level-3.guard"),
      level.findObject("casino.director-bodyguard"),
      level.findObject("police-station.chief-office.chief"),
      level.findObject("police-station.guard")
    ];
  }

  get states() {
    return [this.startFight.bind(this)];
  }

  initialize() {
    const characters = this.actors;
    const chief      = characters[3];
    const director   = characters[0];
    const directorOffice = level.findGroup("casino.director-office");

    characters.push(game.player);
    characters.forEach(character => {
      if (character.isAlive() && !character.isInZone(directorOffice.controlZone)) {
        const script = character.getScriptObject();

        level.moveCharacterToZone(character, directorOffice.controlZone);
        if (script.guardComponent)
          script.guardComponent.disable();
        if (characters.indexOf(character) < characters.indexOf(chief))
          character.lookAt(chief);
        else
          character.lookAt(director);
      }
    });
    level.cameraFocusRequired(director);
    try {
      this.saveLocked = true;
    } catch (err) {}
    super.initialize();
  }

  startFight() {
    const chief    = this.actors[3];
    const director = this.actors[0];

    director.actionQueue.pushSpeak(
      "Ah, sheriff, darling, to what do I ow the pleasure ?", 4000, "green"
    );
    director.actionQueue.pushWait(3);
    director.actionQueue.pushScript(() => {
      chief.actionQueue.pushSpeak(
        "Cut the crap Mordino. I'm taking you in. Surrender now and you'll get a fair trial.",
        6500, "red"
      );
      chief.actionQueue.start();
    });
    director.actionQueue.pushWait(6);
    director.actionQueue.pushSpeak(
      "Come on, you're smarter than that. There are two ways this will end.", 5000, "yellow"
    );
    director.actionQueue.pushWait(5);
    director.actionQueue.pushSpeak(
      "You either leave my office with all your organs still inside your body...", 5000, "orange"
    );
    director.actionQueue.pushWait(5);
    director.actionQueue.pushSpeak(
      "Or you die.", 3000, "red"
    );
    director.actionQueue.pushWait(3);
    director.actionQueue.pushScript(() => {
      chief.actionQueue.pushSpeak("So that's how it's gonna be huh...", 3000, "red");
      chief.actionQueue.pushWait(3);
      chief.actionQueue.pushScript(this.triggerNextStep.bind(this));
      chief.actionQueue.start();
    });
    director.actionQueue.start();
  }

  onCombatTurn(character)          { this.triggerCombat(); }
  onDamageTaken(character, dealer) { this.triggerCombat(); }

  triggerCombat() {
    this.actors.forEach(function (actor) { actor.actionQueue.reset(); });
    this.finalize();
  }

  finalize() {
    const chief = this.actors[3];

    super.finalize();
    level.addTextBubble(chief, "Catch'em ! Dead or alive !", 3000, "red");
    game.setFactionAsEnemy("city-sample", "mordino", true);
    game.setFactionAsEnemy("player",      "mordino", true);
    this.actors.forEach(function (actor) {
      const script = actor.getScriptObject();

      if (actor.isAlive() && script.guardComponent)
        script.guardComponent.enabled();
    });
  }
}

function clearMordinoDudes() {
  const mordinoGuardGroup = level.findGroup("casino.guards.level-1");

  while (mordinoGuardGroup.objects.length)
    level.deleteObject(mordinoGuardGroup.objects[0]);
  level.tryToEndCombat();
}

function endScene() {
  const chief =  level.findObject("police-station.chief-office.chief");

  if (chief.isAlive()) {
    level.setCharacterPosition(chief, 4, 41, 0);
    level.setCharacterPosition(game.player, 7, 41, 0);
    level.cameraFocusRequired(game.player);
  }
}

class CatchMordino extends QuestHelper {
  initialize() {
    this.model.location = "city-sample";
    this.onLevelChanged();
  }

  get killCount() { return this.model.hasVariable("killCount") ? this.model.getVariable("killCount") : 0; }
  set killCount(value) { this.model.setVariable("killCount", value); }

  getObjectives() {
    const array = [];

    array.push({
      label: this.tr("speak-to-chief"),
      success: this.model.isObjectiveCompleted("speak-to-chief")
    });
    array.push({
      label: this.tr("chief-must-live"),
      success: this.model.isObjectiveCompleted("kill"),
      failed: this.model.hasVariable("chief-dead")
    });
    array.push({
      label: this.tr("kill-guards"),
      success: this.model.isObjectiveCompleted("kill-guard") && this.model.isObjectiveCompleted("kill-bodyguard")
    });
    array.push({ label: this.tr("kill"), success: this.model.isObjectiveCompleted("kill-mordino") });
    return array;
  }

  onLevelChanged() {
    if (level.name === this.model.location)
      this.mordinoScene = new MordinoScene(this);
    else
      delete this.mordinoScene;
  }

  onCharacterKilled(victim, killer) {
    switch (victim.path) {
    case "casino.director":
      this.model.completeObjective("kill-mordino");
      this.killCount++;
      break ;
    case "casino.director-bodyguard":
      this.model.completeObjective("kill-bodyguard");
      this.killCount++;
      break ;
    case "casino.guards.level-3.guard":
      this.model.completeObjective("kill-guard");
      this.killCount++;
      break ;
    case "police-station.chief-office.chief":
      this.model.setVariable("chief-dead", true);
      break ;
    }
    if (this.killCount >= 3)
      this.model.completed = true;
  }

  get xpReward() {
    let xp = 250;

    this.getObjectives().forEach(objective => {
      if (objective.success)
        xp += 500;
      else if (objective.failed)
        xp -= 333;
    });
    return xp;
  }

  onSuccess() {
    super.onSuccess();
    game.dataEngine.addReputation("city-sample", 150);
    game.dataEngine.addReputation("mordino",     -150);
    clearMordinoDudes();
    game.asyncAdvanceTime(15, endScene);
  }

  startMordinoScene() {
    this.mordinoScene.initialize();
  }
}

export function create(model) {
  return new CatchMordino(model);
}
