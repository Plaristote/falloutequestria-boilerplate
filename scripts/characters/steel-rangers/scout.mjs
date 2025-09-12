import {CharacterBehaviour} from "./../character.mjs";

const dialogTrRoot = "dialogs.steel-rangers/scout";

function bubbleText(key) {
  return i18n.t(`${dialogTrRoot}.bubbles.${key}`);
}

function genderSuffix() {
  return game.player.statistics.gender == "male" ? "Brother" : "Sister";
}

function isPlayerSteelRanger() {
  return game.player.statistics.perks.indexOf("steel-ranger") >= 0;
}

function firstSteelRanger() {
  for (let i = 0 ; i < level.objects.length ; ++i) {
    const character = level.objects[i];
    if (character.statistics.faction == "steel-rangers") {
      return character;
    }
  }
  return null;
}

export default class extends CharacterBehaviour {
  constructor(model) {
    super(model);
  }

  get isSergeant() {
    return firstSteelRanger() == this.model;
  }

  get displayName() {
    return this.isSergeant ? i18n.t("character-names.steel-rangers/sergeant") : null;
  }

  get dialog() {
    return this.isSergeant && !isPlayerSteelRanger() ? "steel-rangers/scout" : null;
  }

  get textBubbles() {
    if (isPlayerSteelRanger()) {
      return [
        {content: bubbleText(`greet${genderSuffix()}`), duration: 3000},
        {content: bubbleText("rangerLament#1"), duration: 5555}
      ];
    }
    return [
      {content: bubbleText("moveAlong"),   duration: 2500 },
      {content: bubbleText("talkToSarge"), duration: 5000 },
      {content: bubbleText("banter"),      duration: 3232 }
    ];
  }

  onLook() {
    if (this.isSergeant) {
      game.appendToConsole(
        i18n.t(dialogTrRoot + ".inspect.sergeant")
        + ' ' + this.characterStateInspectionText()
      );
      return true;
    }
    return super.onLook();
  }
}
