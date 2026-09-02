import {DialogHelper} from "./helpers.mjs";

const DISTANCE_SETTINGS = ["close", "medium", "far"];
const SUPPORT_STYLES    = ["fire-support", "suppressing-fire"];
const TARGET_ATTITUDES  = ["tactician", "predator", "opportunist"];

export default class CompanionDialog extends DialogHelper {
  constructor(dialog) {
    super(dialog);
    this.visitedMenu = false;
  }

  tr(name, vars = {}) {
    if (name.startsWith("companion."))
      return this.dialog.tWithFallback(name, vars, i18n.t(`dialogs.${name}`, vars));
    return this.dialog.tr(name, vars);
  }

  getEntryPoint() {
    return this.entryDialog();
  }

  get customMenuAnswers() {
    return [];
  }

  entryDialog() {
    const text = this.visitedMenu ? this.tr("companion.reentry") : this.tr("companion.entry");

    this.visitedMenu = true;
    return {
      text: text,
      answers: [
        ...this.customMenuAnswers,
        {
          symbol:   "companion-tactics",
          textHook: () => this.tr("companion.entry-tactics"),
          hook:     this.tacticsDialog.bind(this)
        },
        {
          symbol:   "companion-equipment",
          textHook: () => this.tr("companion.entry-equipment"),
          hook:     this.equipmentDialog.bind(this)
        },
        {
          symbol:   "companion-distance",
          textHook: () => this.tr("companion.entry-distance"),
          hook:     this.distanceDialog.bind(this)
        },
        {
          symbol:   "exit",
          textHook: () => this.tr("companion.entry-exit")
        }
      ]
    };
  }

  get backToMenuAnswer() {
    return {
      symbol:   "companion-back",
      textHook: () => this.tr("companion.back"),
      hook:     this.entryDialog.bind(this)
    };
  }

  // BEGIN Distance
  distanceDialog() {
    return {
      text: this.tr("companion.distance"),
      answers: [
        ...DISTANCE_SETTINGS.map(setting => this.makeDistanceChoice(setting)),
        this.backToMenuAnswer
      ]
    };
  }

  makeDistanceChoice(setting) {
    return {
      symbol:   `companion-distance-${setting}`,
      textHook: () => this.tr(`companion.distance-${setting}`),
      hook:     this.setDistance.bind(this, setting)
    };
  }

  setDistance(setting) {
    this.dialog.npc.setVariable("stalkingSetting", setting);
    return this.entryDialog();
  }
  // END Distance

  // BEGIN Tactics
  tacticsDialog() {
    return {
      text: this.tr("companion.tactics"),
      answers: [
        ...SUPPORT_STYLES.map(style => this.makeSupportStyleChoice(style)),
        {
          symbol:   "companion-tactics-solo",
          textHook: () => this.tr("companion.tactics-solo"),
          hook:     this.soloTacticsDialog.bind(this)
        },
        this.backToMenuAnswer
      ]
    };
  }

  makeSupportStyleChoice(style) {
    return {
      symbol:   `companion-tactics-${style}`,
      textHook: () => this.tr(`companion.tactics-${style}`),
      hook:     this.setSupportStyle.bind(this, style)
    };
  }

  setSupportStyle(style) {
    this.dialog.npc.setVariable("companionSupportStyle", style);
    return this.entryDialog();
  }

  soloTacticsDialog() {
    return {
      text: this.tr("companion.tactics-solo-prompt"),
      answers: [
        ...TARGET_ATTITUDES.map(attitude => this.makeTargetAttitudeChoice(attitude)),
        this.backToMenuAnswer
      ]
    };
  }

  makeTargetAttitudeChoice(attitude) {
    return {
      symbol:   `companion-tactics-solo-${attitude}`,
      textHook: () => this.tr(`companion.tactics-solo-${attitude}`),
      hook:     this.setSoloTactics.bind(this, attitude)
    };
  }

  setSoloTactics(attitude) {
    this.dialog.npc.setVariable("companionSupportStyle", "solo");
    this.dialog.npc.setVariable("targetAttitude", attitude);
    return this.entryDialog();
  }
  // END Tactics

  // BEGIN Equipment
  isUseSlot(slot) {
    return slot === "use" || slot.startsWith("use-");
  }

  itemFitsSlot(inventory, slot, item) {
    if (!inventory.canEquipItem(item, slot))
      return false;
    return this.isUseSlot(slot) ? item.category === "weapon" : true;
  }

  getEquippableItems(inventory, slot) {
    const result = [];
    const itemTypes = [];

    for (let i = 0 ; i < inventory.items.length ; ++i) {
      const item = inventory.items[i];
      const alreadyCovered = itemTypes.indexOf(item.itemType) >= 0;

      if (!alreadyCovered && this.itemFitsSlot(inventory, slot, item)) {
        result.push(item);
        itemTypes.push(item.itemType);
      }
    }
    return result;
  }

  equipmentDialog() {
    const inventory = this.dialog.npc.inventory;
    const slots = inventory.slotNames;

    return {
      text: this.tr("companion.equipment"),
      answers: [
        ...slots.map(slot => this.makeSlotChoice(slot)),
        this.backToMenuAnswer
      ]
    };
  }

  makeSlotChoice(slot) {
    return {
      symbol:   `companion-equip-slot-${slot}`,
      textHook: () => this.tr(`companion.equip-slot-${slot}`),
      hook:     this.equipItemsForSlot.bind(this, slot, null)
    };
  }

  buildSlotPromptText(inventory, slot, promptText) {
    const equipped = inventory.getEquippedItem(slot);

    if (equipped)
      return `${this.tr("companion.equip-slot-current", { item: equipped.displayName })} ${promptText}`;
    return promptText;
  }

  equipItemsForSlot(slot, overrideText) {
    const inventory = this.dialog.npc.inventory;
    const items = this.getEquippableItems(inventory, slot);
    const promptText = items.length === 0
      ? this.tr("companion.equip-slot-empty")
      : this.tr("companion.equip-slot-prompt");

    return {
      text: overrideText || this.buildSlotPromptText(inventory, slot, promptText),
      answers: [
        ...items.map(item => this.makeEquipItemChoice(slot, item)),
        this.backToMenuAnswer
      ]
    };
  }

  makeEquipItemChoice(slot, item) {
    return {
      symbol:   `companion-equip-${slot}-${item.name}`,
      textHook: () => item.displayName,
      hook:     this.tryEquipItem.bind(this, slot, item)
    };
  }

  tryEquipItem(slot, item) {
    const inventory = this.dialog.npc.inventory;

    if (this.isUseSlot(slot) && item.maxAmmo > 0)
    {
      const totalAmmo = inventory.count(item.script.ammoType) + item.ammo;

      if (totalAmmo <= 0)
        return this.equipItemsForSlot(slot, this.tr("companion.equip-no-ammo", { item: i18n.t(`items.${item.displayName}`) }));
    }
    inventory.equipItem(item, slot);
    if (typeof item.script.onReloaded == "function")
      item.script.onReloaded();
    return this.entryDialog();
  }
}
