class MyLocker {
  constructor(model) {
    this.model = model;
  }
  
  onTakeItem(character, item, quantity) {
    return this.preventStealing(character);
  }
  
  onPutItem(character, item, quantity) {
    return this.preventStealing(character);
  }
  
  preventStealing(character) {
    const npc = level.getObjectByName("MyNPC");

    if (npc && npc.isAlive()) {
      level.addTextBubble(npc, "Hey ! Don't touch that !", 4000, "red");
      return false;
    }
    return true;
  }
}

export function create(model) {
  return new MyLocker(model);
}
