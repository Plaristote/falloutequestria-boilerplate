import MeetingScene from "../../scenes/thornhoof/councilMeeting.mjs";

export default class CouncilRoom {
  constructor(model) {
    this.model = model;
    this.meetingScene = new MeetingScene(this);
  }

  onZoneEntered(object) {
    if (object === game.player
    && !this.model.hasVariable("meeting")
    && game.quests.hasQuest("thornhoof/besiegedWalls")) {
      this.model.setVariable("meeting", 1);
      this.meetingScene.initialize();
      game.quests.getQuest("thornhoof/besiegedWalls").completeObjective("meet-council");
      this.model.tasks.addTask("vellumScrollIntro", 4987);
    }
  }

  vellumScrollIntro() {
    if (!this.meetingScene.active && !this.model.hasVariable("vellumScrollIntro")) {
      const vellumScroll = level.findObject("thornhoof-scroll");
      const participants = [vellumScroll, game.player];
      const occupants = this.model.findControlZoneOccupants(occupant => participants.indexOf(occupant) >= 0);

      if (occupants.length === 2 && vellumScroll.fieldOfView.isDetected(game.player)) {
        this.model.setVariable("vellumScrollIntro", 1);
        vellumScroll.setVariable("dialogEntry", "councilMeeting/entry");
        vellumScroll.script.startDialog();
        return ;
      }
    }
    this.model.tasks.addTask("vellumScrollIntro", 4987);
  }
}
