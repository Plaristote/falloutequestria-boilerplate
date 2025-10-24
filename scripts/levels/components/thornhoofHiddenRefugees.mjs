import {RoutineComponent} from "../../behaviour/routine.mjs";

function headTowards(self, zone, callback) {
  self.script.temporaryActionRepeater = function() {
    const actions = self.actionQueue;
    actions.reset();
    actions.pushMoveToZone(zone);
    actions.pushScript({
      onTrigger: function() {
        if (typeof callback == "function")
          callback(self);
      },
      onCancel: function() {
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
    game.uniqueCharacterStorage.detach(character);
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
  console.log("POPPED CHARACTERS INTO ZONE", zone);
}

function refugeesArrested() {
  const quest = game.quests.getQuest("thornhoof/refugeesFight");
  return quest && quest.getVariable("refugeesArrested", 0) == 1;
}

export default class ThornhoofHiddenRefugees {
  constructor(parent) {
    this.routineComponent = new RoutineComponent(parent, this.routine, "hiddenRefugees_");
    this.routineComponent.interrupted = refugeesArrested();
  }

  get routine() {
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
    console.log("MEEPMEEPMEEPMEEP ON LEVEL LOADED CALLED");
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
    if (!this.loaded) return ;
    const popped = this.arePoppedIntoLevel();
    const shouldBeHere = level.name == "thornhoof-town";
    if (shouldBeHere && popped) {
      console.log("GoToCellar going to entrance", level.name);
      groupHeadTowards(this.characters, "to-entrance", (self) => {
        game.uniqueCharacterStorage.detachCharacter(self);
      });
    } else if (!shouldBeHere && !popped) {
      popIntoLevel(this.characters, "to-entrance");
      groupHeadTowards(this.characters, "dustlock-cellar");
    }
  }

  goToShaman() {
    if (!this.loaded) return ;
    const popped = this.arePoppedIntoLevel();
    const shouldBeHere = level.name == "thornhoof-industrial-zone";
    if (shouldBeHere && popped) {
      console.log("GoToShaman going to entrance", level.name);
      groupHeadTowards(this.characters, "to-entrance", (self) => {
        game.uniqueCharacterStorage.detachCharacter(self);
      });
    } else if (!shouldBeHere && !popped) {
      popIntoLevel(this.characters, "to-entrance");
      groupHeadTowards(this.characters, "shaman-tent");
    }
  }

  goToLeaf() {
    if (this.arePoppedIntolevel())
      depopFromLevel(this.characters);
    popIntoLevel(this.characters, "leaf-office-entrance");
  }

  arePoppedIntoLevel() {
    return this.characters.length > 0 && level.objects.indexOf(this.characters[0]) >= 0;
  }

  disappearCharacters() {
    if (this.arePoppedIntoLevel())
      depopFromLevel(this.characters);
    this.characters.forEach(character => {
      character.takeDamage(character.statistics.hitPoints + 1, null);
    });
  }
}
