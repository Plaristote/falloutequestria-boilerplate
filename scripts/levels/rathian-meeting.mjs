import {LevelBase} from "./base.mjs";
import {MeetingScene} from "../scenes/rathian-meeting.mjs";
import {getValueFromRange} from "../behaviour/random.mjs";
import {rathianTemplate} from "../characters/rathian/template.mjs";

function banditTemplate(type, amount = 1) {
  const items = [];
  const capsCount = getValueFromRange(0, 13) - 1;
  const sparkleCola = getValueFromRange(0, 100) > 75;
  const appleCider = getValueFromRange(0, 100) > 90;
  const slots = {};

  if (capsCount > 0)
    items.push({ itemType: "bottlecaps", quantity: capsCount });
  if (sparkleCola)
    items.push({ itemType: "sparkle-cola" });
  if (appleCider)
    items.push({ itemType: "apple-cider" });
  if (type === "B")
    slots.armor = { hasItem: true, itemType: "metal-armor" };
  return {
    sheet: `bandit-${type}`,
    script: "character.mjs",
    inventory: {
      slots: slots,
      items: items
    },
    amount: amount
  };
}

class Level extends LevelBase {
  constructor(model) {
    super();
    this.model = model;
    console.log("BUILD rathian-meeting");
  }

  get rathian() {
    return game.getCharacter("rathian");
  }
	
  initialize() {
    level.tasks.addTask("delayedInitialize", 1, 1);
  }

  delayedInitialize() {
    this.bandits = level.createNpcGroup({
      name: "bandits",
      members: [banditTemplate("B"), banditTemplate("A"), banditTemplate("A"), banditTemplate("C")]
    });
    this.rathianParty = level.createNpcGroup({
      name: "Rathian",
      members: [rathianTemplate]
    });
    this.rathianParty.list[0].isUnique = true;
    this.scene = new MeetingScene(this, this.bandits, this.rathianParty);
    level.tasks.addTask("startAmbush", 1, 1);
  }
  startAmbush() {
    game.appendToConsole(i18n.t("scenes.rathian-meeting.console-message"));
    this.bandits.insertIntoZone(level, "bandits-entry");
    this.scene.initialize();
  }
  onZoneExited(zone, object) {
    if (object === game.player
      && zone === "escape-zone"
      && this.scene
      && this.scene.active) {
      this.scene.playerEscaping();
    }
  }
  onCombatEnded() {
    if (level.hasVariable("rathianLoaded") && level.getVariable("rathianTalked", 0) === 0)
      level.tasks.addTask("startDialog", 1500, 1);
  }
  startDialog() {
    const npc = this.rathian;
    if (npc.isAlive() && game.player.isAlive()) {
      level.cameraFocusRequired(npc);
      level.initializeDialog(npc, "rathian-introduction");
      level.setVariable("rathianTalked", 1);
    }
  }
  rathianJoinsPlayer() {
    const npc = this.rathian;
    if (this.rathianParty)
      this.rathianParty.removeCharacter(npc);
    game.playerParty.addCharacter(npc);
  }
  playerJoinsRathian() {
    this.rathianJoinsPlayer();
    level.tasks.addTask("goToJunkville", 150, 1);
  }
  goToJunkville() {
    console.log("Trigger goToJunkville");
    game.asyncAdvanceTime(2880, () => {
      const city = worldmap.getCity("junkville");
      worldmap.setPosition(city.position.x, city.position.y);
      game.switchToLevel("junkville", "");
    });
  }
}

export function create(model) {
  return new Level(model);
}

