import {RoutineComponent} from "../../behaviour/routine.mjs";

function headTowards(self, zone, callback) {
  const onTriggerCallback = function() {
    if (typeof callback == "function")
      callback(self);
  };

  if (typeof zone == "string")
    zone = level.getZoneFromName(zone);
  if (self.isInZone(zone))
    return onTriggerCallback();
  self.script.temporaryActionRepeater = function() {
    const actions = self.actionQueue;
    actions.reset();
    actions.pushMoveToZone(zone);
    actions.pushScript({
      onTrigger: onTriggerCallback,
      onCancel: function() {
        if (self.isInZone(zone))
          onTriggerCallback();
        else
          self.tasks.addTask("temporaryActionRepeater", 1000, 1);
      }
    });
    actions.start();
  };
  self.script.temporaryActionRepeater();
}

function groupHeadTowards(characters, zone, callback) {
  characters.forEach(character => {
    headTowards(character, zone, callback);
  })
}

function depopFromLevel(characters) {
  characters.forEach(character => {
    game.uniqueCharacterStorage.detachCharacter(character);
    character.actionQueue.reset();
    character.tasks.removeTask("temporaryActionRepeater");
  });
}

function popIntoLevel(characters, zone) {
  characters.forEach(character => {
    game.uniqueCharacterStorage.loadCharacterToZone(character.characterSheet, level.getTileZone(zone))
    character.actionQueue.reset();
    character.tasks.removeTask("temporaryActionRepeater");
  });
}

function routineInterrupted() {
  const quest = game.quests.getQuest("thornhoof/refugeesFight");
  return quest && quest.script.refugeesDisappeared;
}

export default class ThornhoofHiddenRefugees {
  constructor(parent) {
    this.routineComponent = new RoutineComponent(parent, this.routine, "hiddenRefugees_");
    this.routineComponent.interrupted = routineInterrupted();
  }

  get routine() {
    const quest = game.quests.getQuest("thornhoof/refugeesFight");

    if (quest && quest.script.refugeesSaved) {
      return [
        { hour: 20, name: "at-shaman's",   callback: this.goToShaman.bind(this), location: "thornhoof-town" },
        { hour: 16, name: "at-bar",        callback: this.goToBar.bind(this),    location: "thornhoof-town" }
      ];
    } else if (quest && quest.script.refugeesWork) {
      return [
        { hour: 7, name: "at-work",        callback: this.goToWork.bind(this) },
        { hour: 0, name: "at-shaman's",    callback: this.goToShaman.bind(this), location: "thornhoof-town" }
      ];
    }
    return [
      { hour: 7, name: "hidden-in-cellar", callback: this.goToCellar.bind(this), location: "thornhoof-industrial-zone" },
      { hour: 0, name: "at-shaman's",      callback: this.goToShaman.bind(this), location: "thornhoof-town" }
    ];
  }

  get characters() {
    const result = [];
    const names = ["stitch", "root", "cleft"];
    for (const name of names) {
      const candidate = game.getCharacter(`thornhoof/refugees/${name}`);
      if (candidate && candidate.isAlive())
        result.push(candidate);
    }
    return result;
  }

  get areAlive() {
    return this.characters.length > 0;
  }

  targetZoneForCurrentLevel() {
    return level.name == "thornhoof-town" ? "shaman-tent" : "dustlock-cellar";
  }

  onLevelLoaded(levelName) {
    const currentRoutine = this.routineComponent.getCurrentRoutine();

    this.loaded = true;
    if (currentRoutine?.location == levelName && !this.routineComponent.interrupted) {
      popIntoLevel(this.characters, this.targetZoneForCurrentLevel());
    } else {
      this.characters.forEach(character => {
        character.actionQueue.reset();
        character.tasks.removeTask("temporaryActionRepeater");
        game.uniqueCharacterStorage.detachCharacter(character);
      });
    }
  }

  onLevelExited(levelName) {
    switch (levelName) {
      case "thornhoof-industrial-zone":
        this.updateHideoutWeaponState();
        break ;
    }
  }

  updateHideoutWeaponState() {
    const shelf = level.findObject("dustlock-home.cellar.table");

    if (shelf && shelf.script)
      shelf.script.updateHideoutWeaponState();
  }

  goToCellar() {
    if (!this.loaded || routineInterrupted()) return ;
    const popped = this.arePoppedIntoLevel();
    const shouldBeHere = level.name == "thornhoof-industrial-zone";
    if (!shouldBeHere && popped) {
      console.log("GoToCellar going to entrance", level.name);
      groupHeadTowards(this.characters, "to-entrance", (self) => {
        game.uniqueCharacterStorage.detachCharacter(self);
      });
    } else if (shouldBeHere && !popped) {
      popIntoLevel(this.characters, "to-entrance");
      groupHeadTowards(this.characters, "dustlock-cellar");
    }
  }

  goToShaman() {
    if (!this.loaded || routineInterrupted()) return ;
    const popped = this.arePoppedIntoLevel();
    const shouldBeHere = level.name == "thornhoof-town";
    if (!shouldBeHere && popped) {
      console.log("GoToShaman going to entrance", level.name);
      groupHeadTowards(this.characters, "to-entrance", (self) => {
        game.uniqueCharacterStorage.detachCharacter(self);
      });
    } else if (shouldBeHere && !popped) {
      popIntoLevel(this.characters, "to-entrance");
      groupHeadTowards(this.characters, "shaman-tent");
    } else if (shouldBeHere && popped) {
      groupHeadTowards(this.characters, "shaman-tent");
    }
  }

  goToBar() {
    if (!this.loaded || routineInterrupted()) return ;
    const popped = this.arePoppedIntoLevel();
    const shouldBeHere = level.name == "thornhoof-town";
    if (!shouldBeHere && popped) {
      groupHeadTowards(this.characters, "to-entrance");
    } else if (shouldBeHere && !popped) {
      popIntoLevel(this.characters, "to-entrance");
      groupHeadTowards(this.characters, "bar-refugees-table");
    } else if (shouldBeHere && popped) {
      groupHeadTowards(this.characters, "bar-refugees-table");
    }
  }

  goToWork() {
    if (!this.loaded || routineInterrupted()) return ;
    if (this.arePoppedIntoLevel()) {
      groupHeadTowards(this.characters, "to-entrance", (self) => {
        game.uniqueCharacterStorage.detachCharacter(self);
      });
    }
  }

  goToLeaf() {
    if (this.arePoppedIntoLevel())
      depopFromLevel(this.characters);
    popIntoLevel(this.characters, "leaf-office-entrance");
  }

  areIntoLeafOffice() {
    const zone = level.getZoneFromName("leaf-office-entrance");
    for (let i = 0 ; i < this.characters.length ; ++i) {
      if (this.characters[i].isInZone(zone))
        return true;
    }
    return false;
  }

  arePoppedIntoLevel() {
    return this.characters.length > 0 && level.objects.indexOf(this.characters[0]) >= 0;
  }

  disappearCharacters() {
    if (this.arePoppedIntoLevel())
      depopFromLevel(this.characters);
  }

  executeCharacters() {
    this.disappearCharacters();
    this.characters.forEach(character => {
      character.takeDamage(character.statistics.hitPoints + 1, null);
    });
  }
}
