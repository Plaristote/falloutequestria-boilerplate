// Shared helpers for Junkville's nightly communal assembly (the "assembly"
// routine in resident-routine.mjs, which runs from 9pm to 11pm).

const DEBATE_COLORS = ["white", "yellow", "lightblue", "lightgreen"];
const CHATTER_LINE_COUNT = 14;
const SPEAKING_DURATION = 4500;

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

export function isAssemblyRoutine(character) {
  const behaviour = character && character.getScriptObject ? character.getScriptObject() : character;
  const routine = behaviour && behaviour.routineComponent;

  return !!routine && routine.isActiveRoutine("assembly");
}

// The quest-related debate (scenes/junkville/negociationAssembly.mjs) is playing.
export function isQuestDebateRunning() {
  const scene = level.script && level.script.negociationScene;

  return !!scene && scene.active;
}

// Randy told the dogs' answer is expected: the debate starts once everypony is here.
export function isQuestAssemblyWaiting() {
  return game.timeManager.hour >= 21
      && level.tasks.hasTask("waitForAssembly")
      && !isQuestDebateRunning();
}

function isJunkvillePony(character) {
  return character.type == "Character" && character.statistics.faction === "junkville";
}

export function getAssemblyZone() {
  return game.level.getZoneFromName("ekklesia");
}

// Junkville ponies who are not (yet) at the assembly place.
export function getMissingParticipants(except) {
  const zone = getAssemblyZone();

  if (!zone) return [];
  return level.find(isJunkvillePony).filter(character => {
    return character !== except
        && character.isAlive()
        && !game.level.isInsideZone(zone, character);
  });
}

// Safety net for ponies whose walk to the assembly got interrupted (pushed,
// talked to, path blocked...) without the routine being rescheduled: nudge
// the routine again for anypony idle and outside of the assembly place.
export function gatherStragglers() {
  const zone = getAssemblyZone();
  const now = Date.now();

  if (!zone) return ;
  level.find(isJunkvillePony).forEach(character => {
    const behaviour = character.getScriptObject();
    const routine = behaviour && behaviour.routineComponent;

    if (!routine || routine.interrupted || !routine.isActiveRoutine("assembly")) return ;
    if (!character.isAlive() || character.unconscious || level.isInCombat(character)) return ;
    if (!character.actionQueue.isEmpty() || game.level.isInsideZone(zone, character)) return ;
    if (now - (routine.lastGatherAttempt || 0) < 8000) return ;
    routine.lastGatherAttempt = now;
    routine.triggerRoutine();
  });
}

export function getChatterLine() {
  return i18n.t(`junkville-assembly.chatter-${1 + Math.floor(Math.random() * CHATTER_LINE_COUNT)}`);
}

export function pickChatterSpeaker() {
  const zone = getAssemblyZone();

  if (!zone) return null;
  const speakers = level.getZoneOccupants(zone).filter(character => {
    return isJunkvillePony(character)
        && character.isAlive()
        && !character.unconscious
        && character.actionQueue.isEmpty();
  });
  return speakers.length > 0 ? pick(speakers) : null;
}

export function sayChatter() {
  const speaker = pickChatterSpeaker();

  if (speaker)
    level.addTextBubble(speaker, getChatterLine(), SPEAKING_DURATION, pick(DEBATE_COLORS));
}

// What a pony answers to "talk to" while the assembly is happening.
// Returns undefined outside of assembly time, so the usual behaviour applies.
export function assemblyTalkBubbles(character) {
  if (!isAssemblyRoutine(character)) return undefined;

  let content;
  if (isQuestDebateRunning()) {
    content = i18n.t("junkville-assembly.talk-debate-running");
  } else if (isQuestAssemblyWaiting()) {
    const missing = getMissingParticipants(character);

    content = missing.length > 0
      ? i18n.t("junkville-assembly.talk-waiting-for", { name: pick(missing).statistics.name })
      : i18n.t("junkville-assembly.talk-waiting-all-here");
  } else {
    content = i18n.t(`junkville-assembly.talk-${1 + Math.floor(Math.random() * 5)}`);
  }
  return [{ content: content, duration: SPEAKING_DURATION, color: "white" }];
}
