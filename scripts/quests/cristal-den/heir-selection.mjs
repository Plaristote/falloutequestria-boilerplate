import {HEIRS, isHeirDead, matriarchDead} from "./potioks.mjs";
import {troutReplacedByChangeling} from "./pimp-changeling.mjs";
import {requireQuest, QuestFlags} from "../helpers.mjs";

// How the player judged an heir when reporting to the Matriarch.
// NONE = the player declined to give an opinion (still counts as reported).
export const Rating = {
  NONE: 0,
  POSITIVE: 1,
  NEUTRAL: 2,
  NEGATIVE: 3
};

// Heirs are persisted in game variables so they survive across dialogs/levels.
const ratingKey = id => `heirRating-${id}`;
const debriefKey = id => `heirDebriefed-${id}`;
const suggestedKey = "heirSuggested";
const chosenKey = "crystalDenHeir";
const refusedKey = "heirSelectionRefused";
const introducedKey = "heirSelectionIntroduced";

export const TROUT = "trout";

export function livingHeirs() {
  return Object.keys(HEIRS).filter(id => !isHeirDead(id));
}

export function rateHeir(heirId, rating) {
  game.setVariable(ratingKey(heirId), rating);
}

export function hasRatedHeir(heirId) {
  return game.hasVariable(ratingKey(heirId));
}

export function getHeirRating(heirId) {
  return game.getVariable(ratingKey(heirId), Rating.NONE);
}

// Heirs other than Bitty are reported on through their own job (see
// rewan-security.mjs / crafty-workshop.mjs); Bitty is reported on through the
// Hillburrow sabotage report, where the rating is the whole report.
export function markHeirDebriefed(heirId) {
  game.setVariable(debriefKey(heirId), 1);
}

export function hasReportedHeir(heirId) {
  if (heirId === "bitty")
    return hasRatedHeir("bitty");
  return game.hasVariable(debriefKey(heirId));
}

export function allLivingHeirsReported() {
  const heirs = livingHeirs();

  return heirs.length > 0 && heirs.every(hasReportedHeir);
}

export function getChosenHeir() {
  return game.getVariable(chosenKey, "");
}

// "Trout" is Petiole in disguise: Trout is dead when Petiole is.
export function isTroutHeir() {
  return getChosenHeir() === TROUT;
}

export function isTroutDead() {
  // getQuest, not requireQuest: asking must not create the quest as a side effect.
  const quest = game.quests.getQuest("cristal-den/pimp-changeling");

  return !!quest && !!quest.script.petioleKilled;
}

export function hasChosenHeir() {
  return game.hasVariable(chosenKey);
}

export function hasRefusedToChoose() {
  return game.hasVariable(refusedKey);
}

export function setRefusedToChoose() {
  game.setVariable(refusedKey, 1);
}

export function wasSuccessionIntroduced() {
  return game.hasVariable(introducedKey);
}

export function markSuccessionIntroduced() {
  game.setVariable(introducedKey, 1);
}

export function canDiscussSuccession() {
  return !matriarchDead() && !hasChosenHeir() && allLivingHeirsReported();
}

export function canSuggestTrout() {
  return !matriarchDead() && !hasChosenHeir() && troutReplacedByChangeling();
}

export function suggestHeir(heirId) {
  game.setVariable(suggestedKey, heirId);
  // Suggesting Trout is the quiet way of carrying out the Changeling Queen's
  // potiok-chaos quest. If the Queen never gave it to the player, they are
  // improvising it: the quest is created (hidden) so the Queen can debrief later.
  if (heirId === TROUT) {
    const quest = requireQuest("cristal-den/potiok-chaos", QuestFlags.HiddenQuest);

    quest.script.proposeTroutPlan();
  }
}

export function getSuggestedHeir() {
  return game.getVariable(suggestedKey, "");
}

function ratingScore(heirId) {
  switch (getHeirRating(heirId)) {
    case Rating.POSITIVE: return 3;
    case Rating.NEUTRAL: return 2;
    case Rating.NONE: return 1;
  }
  return 0; // Rating.NEGATIVE
}

// Best-rated living heir (ties go to HEIRS declaration order).
export function bestHeir() {
  let best = null;

  livingHeirs().forEach(id => {
    if (best === null || ratingScore(id) > ratingScore(best))
      best = id;
  });
  return best;
}

// The Matriarch weighs the player's pick against what the player themself
// told her. She only overrides a pick the player rated badly (or declined
// to rate) when a better-rated heir is alive. Trout has no rating: she goes
// along with him.
export function resolveMatriarchChoice(suggestedId) {
  if (suggestedId === TROUT)
    return {heir: TROUT, agrees: true};
  const best = bestHeir();

  if (best !== null && best !== suggestedId && ratingScore(suggestedId) <= 1 && ratingScore(best) > ratingScore(suggestedId))
    return {heir: best, agrees: false};
  return {heir: suggestedId, agrees: true};
}

// Records the final decision. Returns {heir, agrees}.
export function finalizeHeir() {
  const result = resolveMatriarchChoice(getSuggestedHeir());

  game.setVariable(chosenKey, result.heir);
  const chaosQuest = game.quests.getQuest("cristal-den/potiok-chaos");

  if (chaosQuest)
    chaosQuest.script.onHeirChosen(result.heir);
  return result;
}
