export function spriteSheet(model) {
  const level = model.level;

  console.log("Getting roach spritesheet");
  if (level < 10)
    return "roach-small";
  else if (level < 20)
    return "roach-medium";
  return "roach-big";
}

export function onToggled(statistics, toggled) {
  let modifier = toggled ? 1 : -1;

  statistics.setFaceColor(188, 188, 188, 1);
  statistics.strength     -= modifier;
  statistics.perception   -= modifier;
  statistics.charisma     -= (modifier * 5);
  statistics.intelligence -= (modifier * 5);
  statistics.luck         -= modifier;
  statistics.endurance    += modifier;
  statistics.agility      += modifier;
}
