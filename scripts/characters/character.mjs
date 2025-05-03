import {SceneActorComponent} from "./components/sceneActor.mjs";
import {awarenessHint} from "../cmap/perks/awareness.mjs";

export class CharacterBehaviour extends SceneActorComponent {
  constructor(model) {
    super(model);
    this.xpBaseValue = 25;
    this.canPush = true;
  }

  get isBusy() {
    return level.isInCombat(this.model) || !this.model.actionQueue.isEmpty();
  }

  get xpValue() {
    return this.xpBaseValue * this.model.statistics.level;
  }

  get castCount() {
    return this.model.hasVariable("spell-casted") ? this.model.getVariable("spell-casted") : 0;
  }

  set castCount(value) {
    if (value > 0)
      this.model.setVariable("spell-casted", value);
    else
      this.model.removeVariable("spell-casted");
  }

  delayedRemoval(delay = 2500) {
    this.model.tasks.addUniqueTask("triggerDelayedRemoval", delay);
  }

  triggerDelayedRemoval() {
    level.deleteObject(this.model);
  }

  reduceSpellExhaustion() {
    if (this.castCount > 0)
      this.castCount--;
  }

  getHint() {
    if (game.player.statistics.perks.indexOf("awareness") >= 0)
      return awarenessHint(this.model);
    return this.model.statistics.name;
  }

  getAvailableInteractions() {
    if (this.model.isAlive()) {
      const interactions = ["look", "use-object", "use-skill"];

      if (!level.combat) {
        if (this.canPush)
          interactions.unshift("push");
        if (this.dialog || this.textBubbles)
          interactions.unshift("talk-to");
      }
      return interactions;
    }
    return ["use", "look"];
  }

  onLook() {
    var message = i18n.t("inspection.character", {target: this.model.statistics.name});
    const hpPercentage = this.model.statistics.hpPercentage;
    const gender = this.model.statistics.gender;
    const states = {
      "max":    function (value) { return value >= 100; },
      "fine":   function (value) { return value >= 50; },
      "middle": function (value) { return value >= 25; },
      "low":    function (value) { return value >= 10; },
      "min":    function (value) { return value >= 0; }
    }

    message += ' ';
    if (this.model.isAlive()) {
      for (var key in states) {
        if (states[key](hpPercentage)) {
          message += i18n.t(`inspection.character-state-${gender}`, {state: i18n.t(`inspection.character-states.${key}`)});
          break ;
        }
      }
    }
    else
      message += i18n.t(`inspection.character-dead-${gender}`);
    game.appendToConsole(message);
    return true;
  }

  onPush() {
    this.model.moveAway(game.player);
  }

  onDestinationReached() {
    console.log(this.model, "reached destination", this.model.position.x, this.model.position.y);
  }

  onCharacterDetected(character) {
    if (character === game.player && this.dialogDetectionHook())
      return ;
  }

  playReactionSound(reaction) {
    const stats = this.model.statistics;
    const soundCats = {
      "ponies": ["earth-pony", "pegasus", "unicorn"],
      "ghoul": ["ghoul"]
    }
    for (let cat in soundCats) {
      if (soundCats[cat].indexOf(stats.race) >= 0) {
        game.sounds.play(this.model, `${cat}/${stats.gender}/${reaction}-1`)
        return ;
      }
    }
  }

  mitigateDamage(damage, type, dealer) {
    const armor = this.model.inventory.getEquippedItem("armor");
    if (armor?.script?.mitigateDamage)
      damage = armor.script.mitigateDamage(damage, type);
    return damage;
  }

  get hasWeaponsLayers() {
    return true;
  }

  getSpriteSheetLayers() {
    let layers = [];
    if (this.hasWeaponsLayers) {
      const saddle = this.model.inventory.getEquippedItem("saddle");
      const use1   = this.model.inventory.getEquippedItem("use-1");
      const use2   = this.model.inventory.getEquippedItem("use-2");
      const saddleSpriteSheet = saddle?.script?.spriteSheet;
      const use1Layers = use1?.script?.getSpriteSheetLayers;
      const use2Layers = use2?.script?.getSpriteSheetLayers;

      if (saddleSpriteSheet)
        layers.push(saddleSpriteSheet);
      if (use1Layers && use2Layers) {
        const layers1 = use1Layers(1);
        const layers2 = use2Layers(2);
        if (layers1[0])
          layers.push(layers1[0]);
        if (layers2[0])
          layers.push(layers2[0]);
        if (layers1[1])
          layers.push(layers1[1]);
        if (layers2[1])
          layers.push(layers2[1]);
      } else if (use1Layers) {
        layers = layers.concat(use1Layers(1));
      } else if (use2Layers) {
        layers = layers.concat(use2Layers(2));
      }
    }
    return layers.join('+');
  }
}

export function create(model) {
  return new CharacterBehaviour(model);
}
