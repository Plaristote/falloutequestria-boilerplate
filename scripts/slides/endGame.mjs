import {hasAltLeaderTakenOver} from "../quests/junkvilleNegociateWithDogs.mjs";
import {areCaptorsDead} from "../quests/junkvilleDumpsDisappeared.mjs";
import {
  hasCavernBanditsQuest,
  banditsCleared,
  banditsResolution
} from "../quests/junkville/cavernBandits.mjs";
import {DealWithRathian} from "../characters/rathian/flags.mjs";

function getJunkvilleEndingState() {
  const negotiateQuest = game.quests.getQuest("junkvilleNegociateWithDogs");
  const dumpsQuest     = game.quests.getQuest("junkvilleDumpsDisappeared");
  const helpfulQuest   = game.quests.getQuest("junkville/findHelpful");
  const rathianQuest   = game.quests.getQuest("stable-103/rathian");

  const touched = !!(negotiateQuest || dumpsQuest || helpfulQuest
                      || hasCavernBanditsQuest() || areCaptorsDead());

  // --- diamond dogs relationship --------------------------------------
  let dogsOutcome = "unresolved";
  if (negotiateQuest) {
    if (negotiateQuest.isObjectiveCompleted("lose-battle"))
      dogsOutcome = "battle-lost";
    else if (negotiateQuest.isObjectiveCompleted("win-battle"))
      dogsOutcome = "battle-won";
    else if (negotiateQuest.getVariable("escaped", false))
      dogsOutcome = "battle-fled";
    else if (negotiateQuest.isObjectiveCompleted("peaceful-resolve"))
      dogsOutcome = negotiateQuest.getVariable("mediation") === "trade" ? "peace-trade" : "peace-boundary";
    else if (areCaptorsDead())
      dogsOutcome = "dogs-wiped-out";
    else if (hasAltLeaderTakenOver())
      dogsOutcome = "dolly-coldwar";
  } else if (areCaptorsDead()) {
    dogsOutcome = "dogs-wiped-out";
  }

  // Losing the underground battle takes Randy and Junkville's own
  // fighters down with it - that's the one outcome bad enough to be
  // treated as the town itself getting gutted, not just "a bad ending".
  const townDevastated = dogsOutcome === "battle-lost";

  // --- missing scavengers ----------------------------------------------
  let scavengerFate = "not-involved";
  if (dumpsQuest) {
    if (dumpsQuest.isObjectiveCompleted("save-all-captives"))
      scavengerFate = "all-saved";
    else if (dumpsQuest.isObjectiveCompleted("save-captives"))
      scavengerFate = "some-saved";
    else if (dumpsQuest.script && dumpsQuest.script.captiveAllDead && dumpsQuest.script.captiveAllDead())
      scavengerFate = "all-dead";
    else
      scavengerFate = "unresolved";
  }

  // --- cavern bandits ----------------------------------------------------
  let banditsFate = "not-involved";
  if (hasCavernBanditsQuest()) {
    banditsFate = banditsCleared() ? (banditsResolution() || "cleared-unknown") : "unresolved";
  }

  // --- Helpful -------------------------------------------------------
  let helpfulFate = "not-involved";
  if (helpfulQuest) {
    if (helpfulQuest.hasVariable("died")) {
      helpfulFate = "died";
    } else if (helpfulQuest.isObjectiveCompleted("save-helpful")) {
      const helpfulCharacter = game.getCharacter("helpful-copain");
      helpfulFate = (helpfulCharacter && game.playerParty.containsCharacter(helpfulCharacter))
        ? "joined-player"
        : "returned-home";
    } else {
      helpfulFate = "unresolved";
    }
  }

  // --- Rathian ---------------------------------------------------------
  let rathianFate = "unknown";
  if (rathianQuest && rathianQuest.isObjectiveCompleted("dealWithRathian")) {
    const murderState = rathianQuest.getVariable("rathianMurdered", 2);
    if (murderState === 0) {
      rathianFate = "died";
    } else if (murderState === 1) {
      rathianFate = "murdered";
    } else {
      const rathianCharacter = game.getCharacter("rathian");
      const flag = rathianCharacter ? rathianCharacter.getVariable("dealWithRathian", 0) : 0;
      if ((flag & DealWithRathian.LeftWithPlayer) > 0)
        rathianFate = "left-with-player";
      else if ((flag & DealWithRathian.LeaveBehind) > 0 && (flag & DealWithRathian.CellOpened) > 0)
        rathianFate = "returned-to-junkville";
      else if ((flag & DealWithRathian.LeaveBehind) > 0)
        rathianFate = "joined-golden-herd";
      else
        rathianFate = "escaped-unknown";
    }
  }

  return {
    touched,
    townDevastated,
    dogsOutcome,
    scavengerFate,
    banditsFate,
    helpfulFate,
    rathianFate
  };
}

function getJunkvilleDogsSlides(state) {
  const image = "http://leponeyblanc.fr//media/uploads/news/5d90938b505c1.jpg"; // TODO: replace with Junkville/diamond dogs art
  const texts = {
    "peace-trade": "Junkville and the diamond dog pack that once haunted its tunnels became trading partners. Gems flowed up from the dark, medicine and tools flowed down, and for the first time in generations, ponies and dogs stopped flinching at the sight of each other.",
    "peace-boundary": "Junkville and the diamond dogs never became friends, but they stopped being enemies. A quiet line formed at the mouth of the tunnels - dogs kept to their claim, ponies kept to their scrapyard - and the uneasy peace held, year after year.",
    "battle-won": "The diamond dogs who once held Junkville's scavengers hostage were driven back into the dark for good. Junkville paid for its safety in blood, but it kept its home. The tunnels beneath the junkyard stayed sealed, and silent, ever after.",
    "battle-lost": "Junkville's militia never came back up from the tunnels. Randy - the closest thing the town ever had to a leader - died down there with them. Without him, and without its bravest, the town spent its last years being picked apart, one raid at a time.",
    "battle-fled": "The war under Junkville never really ended - it just stopped. Those who could escape did, dragging their wounded back to the surface, and the diamond dogs stayed exactly what they had always been to the town: an unresolved, gnawing threat lurking just beneath its feet.",
    "dolly-coldwar": "Fido's fall put Dolly in charge of the pack, and with her came the old hatred, undiluted. Junkville lived under the permanent threat of a war that could start any day, its tunnels forever sealed, its future forever uncertain.",
    "dogs-wiped-out": "The diamond dog pack that had plagued the tunnels beneath Junkville was wiped out entirely. No more raids, no more ransoms - but no more chance at peace, either. The tunnels stayed empty, and the diamonds stayed buried.",
    "unresolved": null
  };
  const subtitle = texts[state.dogsOutcome];
  return subtitle ? [{ image, subtitle, duration: 8000 }] : [];
}

function getJunkvilleScavengerSlides(state) {
  const image = "http://leponeyblanc.fr//media/uploads/news/5d90938b505c1.jpg"; // TODO: replace with scavengers/captives art
  const texts = {
    "all-saved": "Every scavenger dragged into the tunnels beneath Junkville came back home alive. The town remembered it as the day it proved it never left its own behind.",
    "some-saved": "Not every scavenger made it out of the tunnels. Junkville mourned its dead, celebrated its survivors, and tried, as it always did, to keep moving forward.",
    "all-dead": "None of the missing scavengers made it out alive. Their names joined the long list Junkville kept of everypony the wasteland had taken from it - a list that never stopped growing."
  };
  const subtitle = texts[state.scavengerFate];
  return subtitle ? [{ image, subtitle, duration: 7000 }] : [];
}

function getJunkvilleBanditsSlides(state) {
  const image = "http://leponeyblanc.fr//media/uploads/news/5d90938b505c1.jpg"; // TODO: replace with cavern bandits art
  const texts = {
    "junkville-help": "The cavern bandits who preyed on the roads around Junkville were wiped out by a joint raid of townsfolk and travelers. For weeks afterward, caravans moved through without paying a single toll of blood.",
    "dogs-help": "In an alliance few would have predicted, diamond dogs and ponies fought side by side to clear the bandit nest terrorizing the roads. It wasn't peace - not yet - but it was a start neither side quite expected.",
    "player-solo": "The cavern bandits vanished from the roads around Junkville, and no one in town ever quite figured out how. Just another mystery of the wasteland, as far as Junkville was concerned.",
    "cleared-unknown": "The cavern bandits stopped being a problem for Junkville, one way or another."
  };
  const subtitle = texts[state.banditsFate];
  return subtitle ? [{ image, subtitle, duration: 7000 }] : [];
}

function getJunkvilleHelpfulSlides(state) {
  const image = "http://leponeyblanc.fr//media/uploads/news/5d90938b505c1.jpg"; // TODO: replace with Helpful art
  const texts = {
    "died": "Helpful never got the adventure he'd dreamed of. His parents buried an empty box where the tunnels had collapsed, because there wasn't enough of him left to bury.",
    "joined-player": "Helpful got exactly what he always wanted: to leave Junkville behind and see the world. Wherever the road led next, he was there for it, questions non-stop.",
    "returned-home": "Helpful went back to his parents, safe and sound, and - for a while, at least - stopped complaining about how boring Junkville was. It didn't last. It never does, with colts like him."
  };
  const subtitle = texts[state.helpfulFate];
  return subtitle ? [{ image, subtitle, duration: 7000 }] : [];
}

function getJunkvilleRathianSlides(state) {
  const image = "http://leponeyblanc.fr//media/uploads/news/5d90938b505c1.jpg"; // TODO: replace with Rathian/workshop art
  let subtitle = null;

  switch (state.rathianFate) {
    case "returned-to-junkville":
      subtitle = state.townDevastated
        ? "Rathian tried to make his way back to the workshop he'd built in Junkville. He found ash and dog tracks instead. Whatever knowledge he might have shared with the town died with it."
        : "Rathian went back to the workshop he'd built in Junkville, crates of scavenged electronics and all. Under his care, the town's makeshift fixes slowly became something closer to real technology.";
      break ;
    case "left-with-player":
      subtitle = "Rathian left Junkville behind for good, following you instead wherever the road led. The workshop he'd built stayed exactly as he left it - a crate of unclaimed electronics gathering dust.";
      break ;
    case "joined-golden-herd":
      subtitle = "Rathian never went back to Junkville. He found something closer to a home with the golden herd instead, and whatever the town needed from his workshop, it would have to learn to build on its own.";
      break ;
    case "murdered":
      subtitle = "Rathian died at the end of a blade meant for him specifically. Whatever help he might have brought to Junkville died right along with him.";
      break ;
    case "died":
      subtitle = "Rathian never made it out of his own story. Junkville's workshop went quiet, and stayed that way.";
      break ;
    case "escaped-unknown":
      subtitle = "Rathian slipped away from the whole affair, and Junkville never did learn what became of him, or of the workshop he left behind.";
      break ;
  }
  return subtitle ? [{ image, subtitle, duration: 7000 }] : [];
}

function getJunkvilleCodaSlide(state) {
  const image = "http://leponeyblanc.fr//media/uploads/news/5d90938b505c1.jpg"; // TODO: replace with Junkville establishing/coda art
  let subtitle;

  if (state.townDevastated)
    subtitle = "By the time the dust settled, Junkville was less a town than a memory - a rusted stretch of scrapyard that ponies learned to walk around, not through.";
  else if (state.dogsOutcome === "peace-trade")
    subtitle = "Junkville kept growing, scrap heap by scrap heap, one trade caravan at a time - proof that even in the wasteland, some things could still be built instead of just scavenged.";
  else
    subtitle = "Junkville endured, the way it always had: stubbornly, scrappily, one more day at a time.";

  return { image, subtitle, duration: 8000 };
}

function getJunkvilleSlides() {
  const state = getJunkvilleEndingState();
  if (!state.touched)
    return [];

  return [
    ...getJunkvilleDogsSlides(state),
    ...getJunkvilleScavengerSlides(state),
    ...getJunkvilleBanditsSlides(state),
    ...getJunkvilleHelpfulSlides(state),
    ...getJunkvilleRathianSlides(state),
    getJunkvilleCodaSlide(state)
  ];
}

export default function() {
  console.log("DEBUG: MAKE END GAME SLIDES CALLED");
  return [
    {
      image: "https://static.wikia.nocookie.net/falloutequestria/images/1/15/Equestrian_wasteland_by_idess-d3ins9f.jpg/revision/latest/scale-to-width-down/1000?cb=20110824114959",
      subtitle: "War. War never changes.",
      duration: 6000
    },
    {
      image: "http://leponeyblanc.fr//media/uploads/news/5d90938b505c1.jpg",
      subtitle: "But ponies do.",
      duration: 6000
    },
    ...getJunkvilleSlides()
  ];
}
