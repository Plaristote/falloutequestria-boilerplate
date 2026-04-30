export const lastQuestName = "cristal-den/bibins-rescue-herd";

export function finishedAllQuests() {
  const quest = game.quests.getQuest(lastQuestName);

  return quest && quest.completed;
}
