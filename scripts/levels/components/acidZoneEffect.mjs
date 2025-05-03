import {ZoneEffectComponent} from "./zoneEffect.mjs";

export class AcidZoneEffect extends ZoneEffectComponent {
  applyEffectOn(character) {
    if (character.getObjectType() == "Character") {
      const resistance = character.statistics.poisonResistance;
      var damage = getValueFromRange(10, 20);

      damage = damage * (resistance / 100);
      damage = Math.ceil(damage);
      character.actionQueue.reset();
      character.takeMitigableDamage(damage, "poison", null);
      game.appendToConsole(i18n.t("messages.damaged", {
        target: character.statistics.name,
        damage: damage
      }));
      character.addBuff("irradiated");
    }
  }
}
