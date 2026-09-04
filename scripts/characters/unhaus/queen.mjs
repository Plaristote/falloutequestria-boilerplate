import CharacterBehaviour from "./../changeling.mjs";

export default class extends CharacterBehaviour {
  constructor(model) {
    super(model);
    this.dialog = "unhaus/queen";
  }

  get speakOnDetection() {
    return this.model.getVariable("met", 0) == 0;
  }

  onDied() {
    game.quests.getQuest("changelingQuest").scriptp.onQueenKilled();
  }

  onCharacterDetected(character) {
    const canMakePeace = character == game.player
                         && !this.model.hasVariable("met")
                         && this.model.isEnemy(character)
                         && !level.script.backtrack;
    if (canMakePeace)
      this.onHostileMeeting();
    else
      super.onCharacterDetected(character);
  }

  onHostileMeeting() {
    this.dialogShouldStartAsHostile = true;
    game.diplomacy.setAsEnemy(false, "player", "changeling-hive");
    level.find(object => object.type === "Character")
         .forEach(character => character.fieldOfView.reset());
    if (level.tryToEndCombat())
      this.startDialog();
    else
      console.log("Ooops, for some reason, combat couldn't end, and we can't start the queen's dialogue");
  }
}
