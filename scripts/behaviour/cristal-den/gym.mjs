import {RoutineComponent} from "../routine.mjs";

export class Gym {
  constructor(model) {
    this.model = model;
    this.routineComponent = new RoutineComponent(this, [
      {hour: "22", minute: "01", callback: "startMatches"},
      {hour: "02", minute: "00", callback: "stopMatches" }
    ]);
    this.routineComponent.refreshInterval = 20180;
  }

  initialize() {
    this.routineComponent.updateRoutine();
  }

  get openForMatches() {
    return this.model.tasks.hasTask("scheduleNpcMatch");
  }

  get canPlayerJoinCombat() {
    return !this.combatOngoing && this.routineComponent.getCurrentRoutine().callback == "startMatches";
  }

  get ringZone() {
    return level.getTileZone("ring");
  }

  get ringExitZone() {
    return level.getTileZone("ring-exit");
  }

  get referee() {
    return this.model.findObject("boxing-manager");
  }

  get boxers() {
    return this.model.find("boxer-*").filter(function(character) {
      return character.isAlive();
    });
  }

  get trainingAppliances() {
    return this.model.findGroup("training-appliances").objects;
  }

  get inventoryStorage() {
    return this.model.findObject("storage-chest");
  }

  get ringCharacters() {
    const blacklist = [game.player, this.referee];

    return level.getZoneOccupants(this.ringZone).filter(function(character) {
      return character.type == "Character" && blacklist.indexOf(character) < 0;
    });
  }

  get ringFighters() {
    const fighters = this.ringCharacters;

    if (!this.model.tasks.hasTask("npcCombatTick"))
      fighters.push(game.player);
    return fighters;
  }

  labelForRingName(name) {
    return i18n.t(`cristal-den.ring.names.${name}`);
  }

  get ringName() {
    return this.labelForRingName(this.model.getVariable("ringName"));
  }

  set combatOngoing(value) {
    this.model.setVariable("combat", value ? 1 : 0);
  }

  get combatOngoing() {
    return this.model.getVariable("combat", 0) == 1;
  }

  set combatWinner(value) {
    this.model.setVariable("winner", value.path);
  }

  get combatWinner() {
    return level.findObject(this.model.getVariable("winner"));
  }

  get playerWinCount() {
    return this.model.getVariable("winCount", 0);
  }

  set playerWinCount(value) {
    this.model.setVariable("winCount", value);
    if (value > 0 && value > this.boxers.length)
      onCatchBibinAttention();
  }

  get playerCurrentOpponent() {
    if (this.playerWinCount < 4) {
      const opponent = this.model.findObject(`boxer-${this.playerWinCount + 1}`);

      if (opponent && opponent.isAlive())
        return opponent;
      this.playerWinCount++;
      return this.playerCurrentOpponent;
    }
    return null;
  }

  get nextNpcFighters() {
    return [
      level.findObject(this.model.getVariable("npcFighterA")),
      level.findObject(this.model.getVariable("npcFighterB"))
    ];
  }

  set nextNpcFighters(characters) {
    this.model.setVariable("npcFighterA", characters[0].path);
    this.model.setVariable("npcFighterB", characters[1].path);
  }

  generateCheer() {
    const fighters = this.ringFighters;
    const fighter = fighters[Math.floor(Math.random() * 2)];
    const name = fighter == game.player ? this.ringName : fighter.displayName;
    const cheerIt = Math.floor(Math.random() * 7);

    return [i18n.t(`cristal-den.ring.cheers-${cheerIt}`, {name: name}), 4500, "beige"];
  }

  placeBet(fighter, amount) {
    this.model.setVariable("betOn", fighter.path);
    this.model.setVariable("betAmount", amount);
    this.model.setVariable("betSolved", 0);
    this.model.setVariable("betWon", 0);
  }

  startMatches() {
    this.model.tasks.addUniqueTask("scheduleNpcMatch", 30000, 0);
  }

  stopMatches() {
    this.model.tasks.removeTask("scheduleNpcMatch");
  }

  scheduleNpcMatch() {
    let candidates = this.boxers;

    console.log("Start match triggered", this.combatOngoing, candidates.length > 2);
    if (!this.combatOngoing && candidates.length > 2) {
      const combattants = [];

      while (combattants.length < 2) {
        const i = Math.floor(Math.random() * candidates.length);
        combattants.push(candidates[i]);
        candidates.splice(i, 1);
      }
      this.nextNpcFighters = combattants;
      this.model.tasks.addUniqueTask("startNpcCombat", 30000, 1);
    }
  }

  stashPlayerInventory() {
    game.player.inventory.unequipAllItems();
    game.player.inventory.transferTo(this.inventoryStorage.inventory);
  }

  unstashPlayerInventory() {
    this.inventoryStorage.inventory.transferTo(game.player.inventory);
  }

  startPlayerCombat() {
    if (!this.combatOngoing) {
      const opponent = this.playerCurrentOpponent;

      this.combatOngoing = true;
      game.player.script.invulnerable = true;
      level.moveCharacterToZone(game.player,  "ring-entry-A", 2);
      level.moveCharacterToZone(opponent,     "ring-entry-B", 2);
      level.moveCharacterToZone(this.referee, "ring-entry-C", 2);
      opponent.statistics.hitPoints = opponent.statistics.maxHitPoints;
      this.stashPlayerInventory();
      this.combatPresentation(game.player, opponent);
      this.model.tasks.addTask("triggerPlayerCombat", this.presentationTime, 1);
      this.model.tasks.removeTask("startNpcCombat");
    }
  }

  triggerPlayerCombat() {
    const opponent = this.playerCurrentOpponent;

    opponent.statistics.faction = "";
    opponent.setAsEnemy(game.player);
  }

  onPlayerWinsCombat() {
    this.combatWinner = game.player;
    this.onPlayerCombatEnds();
  }

  onPlayerLosesCombat() {
    this.combatWinner = this.playerCurrentOpponent;
    this.onPlayerCombatEnds();
  }

  onPlayerCombatEnds() {
    const opponent = this.playerCurrentOpponent;
    const actions = this.referee.actionQueue;
    const self = this;
    const winnerName = this.combatWinner == game.player ? this.ringName : this.combatWinner.displayName;

    this.unstashPlayerInventory();
    game.player.script.invulnerable = false;
    opponent.setAsFriendly(game.player);
    opponent.fieldOfView.reset();
    this.model.setVariable("fightWon", this.combatWinner == game.player);
    if (level.combat)
      level.scheduleCombatEnd();
    actions.pushReach(this.combatWinner);
    actions.pushSpeak(i18n.t("cristal-den.ring.combat-ending-part-0"), 5000, "white");
    actions.pushWait(5);
    actions.pushSpeak(i18n.t("cristal-den.ring.combat-ending-part-1", {name: winnerName}), 5000, "white");
    actions.pushWait(5);
    actions.pushScript({
      onTrigger: function() {
        if (self.combatWinner == game.player)
          self.playerWinCount++;
        opponent.statistics.faction = "cristal-den";
        opponent.setAsFriendly(game.player);
        level.moveCharacterToZone(game.player, self.ringExitZone);
        self.finalizeCombat();
      },
      onCancel: function() { self.model.tasks.addTask("onPlayerCombatEnds", 1515, 1); }
    });
    actions.start();
  }

  startNpcCombat() {
    this.combatOngoing = true;
    if (!this.model.tasks.hasTask("npcCombatTick")) {
      const combattants = this.nextNpcFighters;
      level.moveCharacterToZone(combattants[0], "ring-entry-A", 2);
      level.moveCharacterToZone(combattants[1], "ring-entry-B", 2);
      level.moveCharacterToZone(this.referee,   "ring-entry-C", 2);
      combattants.forEach(combattant => { combattant.statistics.hitPoints = combattant.statistics.maxHitPoints; });
      this.combatPresentation(combattants[0], combattants[1]);
      this.model.tasks.addTask("npcCombatTick", this.presentationTime, 1);
    }
  }

  fighterName(character) {
    if (character == game.player)
      return this.ringName;
    return character.displayName;
  }

  combatPresentation(characterA, characterB) {
    const actions = this.referee.actionQueue;
    const self = this;

    actions.reset();
    actions.pushSpeak(i18n.t("cristal-den.ring.combat-introduction-1"), 3000, "white");
    actions.pushWait(3);
    actions.pushSpeak(i18n.t("cristal-den.ring.combat-introduction-2", {
      name1: this.fighterName(characterA),
      name2: this.fighterName(characterB)
    }), 4000, "white");
    actions.pushWait(4);
    actions.pushSpeak(i18n.t("cristal-den.ring.combat-introduction-3"), 3500, "white");
    actions.start();
    this.presentationTime = 7000;
  }

  npcCombatTick() {
    const combattants = this.ringCharacters;
    const it = Math.floor(Math.random() * 2);

    if (combattants.length > 1) {
      this.npcCombatAction(combattants[it], it == 0 ? combattants[1] : combattants[0]);
      this.model.tasks.addTask("npcCombatTick", 1840, 1);
    }
  }

  npcCombatAction(character, target) {
    const actions = character.actionQueue;

    actions.reset();
    actions.pushReach(target);
    actions.pushLookAt(target);
    actions.pushAnimation("melee");
    actions.pushScript(this.npcOnCombatAction.bind(this, character, target));
    actions.start();
  }

  npcOnCombatAction(character, target) {
    const hpLeft = target.statistics.hitPoints;

    if (hpLeft > 15)
      target.takeMitigableDamage(character.statistics.meleeDamage + Math.ceil(Math.random() * 3), "blunt", null);
    else {
      target.addBuff("ko");
      this.model.tasks.removeTask("npcCombatTick");
      this.model.tasks.addTask("npcCombatEnd", 1515, 1);
      this.combatWinner = character;
    }
  }

  npcCombatEnd() {
    const actions = this.referee.actionQueue;
    const self = this;

    actions.pushReach(this.combatWinner);
    actions.pushSpeak(i18n.t("cristal-den.ring.combat-ending-part-0"), 5000, "white");
    actions.pushWait(5);
    actions.pushSpeak(i18n.t("cristal-den.ring.combat-ending-part-1", {name: this.combatWinner.displayName}), 5000, "white");
    actions.pushWait(5);
    actions.pushScript({
      onTrigger: this.finalizeCombat.bind(this),
      onCancel: function() { self.model.tasks.addTask("npcCombatEnd", 1515, 1); }
    });
    actions.start();
    if (this.model.getVariable("betSolved", 1) == 0) {
      this.model.setVariable("betWon", this.combatWinner.path == this.model.getVariable("betOn"))
      this.model.setVariable("betSolved", 1);
    }
  }

  finalizeCombat() {
    level.setCharacterPosition(this.referee, 9, 21, 2);
    this.ringCharacters.forEach(character => {
      level.moveCharacterToZone(character, this.ringExitZone);
    });
    this.combatOngoing = false;
    this.scheduleNpcMatch();
  }
}
