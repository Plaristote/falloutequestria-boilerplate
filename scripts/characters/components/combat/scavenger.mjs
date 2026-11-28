import {evaluateWeapon} from "./equipment-equinoid.mjs";

const DEFAULT_RADIUS  = 8;
const MIN_PROFICIENCY = 60;   // below this skill value, a weapon does not "suit" its user
const MIN_IMPROVEMENT = 1.15; // when swapping an unsuitable weapon: the new one must rate 25% better

function isRatableWeapon(item) {
  return item.category === "weapon" && typeof item.script?.getDamageRange == "function";
}

export default class Scavenger {
  constructor(combat) {
    this.combat = combat;
    this.model = combat.model;
    this.lastRun = 0;
  }

  get script() { return this.model.script || {}; }

  get enabled() {
    if (this.script.scavengesWeapons !== undefined)
      return !!this.script.scavengesWeapons;
    return game.playerParty.containsCharacter(this.model);
  }

  get withContainers() { return !!this.script.scavengesContainers; }
  get radius() { return this.script.scavengeRadius ?? DEFAULT_RADIUS; }

  proficiencyWith(item) {
    return this.model.statistics[item.script.skill] || 0;
  }

  canEquip(item) {
    const script = item.script;

    if (typeof script.canEquipInSlotType != "function")
      return true;
    return script.canEquipInSlotType.call(Object.create(script, {user: {value: this.model}}), "any");
  }

  hasAmmo(item) {
    const ammoType = item.script.ammoType;

    return !ammoType || item.maxAmmo === 0 || item.ammo > 0 || this.model.inventory.count(ammoType) > 0;
  }

  isUsable(item) {
    return isRatableWeapon(item) && this.canEquip(item) && this.hasAmmo(item);
  }

  get usableWeapons() {
    const inventory = this.model.inventory;
    const equipped = ["use-1", "use-2"].map(slot => inventory.getEquippedItem(slot)).filter(item => item);

    return [...equipped, ...inventory.items].filter(item => this.isUsable(item));
  }

  // Returns the rating of the best usable weapon carried, and whether it suits the character
  get carriedWeaponStatus() {
    let best = null;

    for (const item of this.usableWeapons) {
      const rating = evaluateWeapon(this.model, item);

      if (!best || rating > best.rating)
        best = {item, rating};
    }
    if (!best)
      return {rating: 0, suitable: false};
    return {rating: best.rating, suitable: this.proficiencyWith(best.item) >= MIN_PROFICIENCY};
  }

  isWorthTaking(item, carried) {
    if (!this.isUsable(item) || item.script.questItem)
      return false;
    const rating = evaluateWeapon(this.model, item);

    return carried.rating > 0 ? rating > carried.rating * MIN_IMPROVEMENT : rating > 0;
  }

  // Best { entry, item, rating } among what the engine found, or null
  findBestFind(carried) {
    const ap = this.model.actionPoints;
    let best = null;

    for (const entry of this.model.findLootInRange(this.radius, this.withContainers)) {
      if (entry.pathCost + 1 > ap)
        continue ; // too far to get there and back to fighting this turn
      const items = entry.item ? [entry.item] : entry.inventory.items;

      for (const item of items) {
        const rating = isRatableWeapon(item) ? evaluateWeapon(this.model, item) : 0;

        if (rating > (best ? best.rating : 0) && this.isWorthTaking(item, carried))
          best = {entry, item, rating};
      }
    }
    return best;
  }

  // Returns true if it scheduled a trip to pick something up (the turn then goes on when the
  // action queue is done, and the weapon swap will equip what was found).
  tryScavenge() {
    const run = this.combat._combatRunCount;

    if (!this.enabled || this.lastRun === run || this.model.actionPoints < 2)
      return false;
    this.lastRun = run; // at most one attempt per turn, including when the turn is resumed
    const carried = this.carriedWeaponStatus;

    if (carried.suitable)
      return false;
    const find = this.findBestFind(carried);

    if (!find)
      return false;
    this.scheduleTrip(find);
    return true;
  }

  scheduleTrip({entry, item}) {
    const actions = this.model.actionQueue;
    const model = this.model;
    const from = entry.inventory;

    console.log(this.combat.logPrefix, "scavenging", item.itemType, "from", entry.kind, entry.object);
    actions.reset();
    if (entry.pathCost > 0)
      actions.pushReach(entry.object);
    actions.pushScript(() => {
      if (model.useActionPoints(1))
        model.takeLoot(item, from);
      return true;
    });
    actions.start();
  }
}
