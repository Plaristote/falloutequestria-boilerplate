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
    console.log(this.model.path, character.path, "QUEEN DETECTED CHARACTER", character == game.player, !this.model.hasVariable("met"), this.model.isEnemy(character));
    if (character == game.player && !this.model.hasVariable("met") && this.model.isEnemy(character))
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
