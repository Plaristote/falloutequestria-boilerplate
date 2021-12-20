import {getValueFromRange} from "../behaviour/random.mjs";

export class Level {
  constructor(model) {
  }

  initialize() {
    level.tasks.addTask("triggerAcid", 3000, 0);
  }

  onZoneEntered(zoneName, object) {
    if (zoneName == "acid-zone")
      this.applyAcidOn(object);
  }

  triggerAcid() {
    const acidZone = level.tilemap.getZone("acid-zone");

    level.getZoneOccupants(acidZone).forEach(this.applyAcidOn.bind(this));
  }

  applyAcidOn(character) {
    if (character.getObjectType() == "Character") {
      const resistance = character.statistics.poisonResistance;
      var damage = getValueFromRange(10, 20);

      damage = damage * (resistance / 100);
      damage = Math.ceil(damage);
      character.actionQueue.reset();
      character.takeDamage(damage, null);
      game.appendToConsole(i18n.t("messages.damaged", {
        target: character.statistics.name,
        damage: damage
      }));
      character.addBuff("irradiated");
    }
  }
}

export function create(model) {
  return new Level(model);
}

