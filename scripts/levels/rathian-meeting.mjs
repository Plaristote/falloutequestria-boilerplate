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

function makeBanditsParty() {
  const objects = level.objects.filter(object => object.objectName.startsWith("bandits"));

  return level.createNpcGroup({
    name: "bandits",
    faction: "bandits",
    members: objects.length == 0 ? [banditTemplate("B"), banditTemplate("A"), banditTemplate("A"), banditTemplate("C")] : objects
  });
}

function makeRathianParty() {
  const object = game.getCharacter("rathian");

  if (object && game.playerParty.containsCharacter(object))
    return null;
  return level.createNpcGroup({
    name: "Rathian",
    members: object ? [object] : [rathianTemplate]
  });
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
  onLoaded() {
    this.bandits = makeBanditsParty();
    this.rathianParty = makeRathianParty();
    this.rathianParty.list[0].isUnique = true;
    this.scene = new MeetingScene(this);
    if (!level.hasVariable("prepared")) {
      level.setVariable("prepared", 1);
      this.bandits.insertIntoZone(level, "bandits-entry");
      this.scene.initialize();
    }
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

