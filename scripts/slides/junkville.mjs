import {areCaptorsDead} from "../quests/junkvilleDumpsDisappeared.mjs";
import {
  hasCavernBanditsQuest,
  banditsCleared,
  banditsResolution
} from "../quests/junkville/cavernBandits.mjs";
import getRathianFate from "./rathian.mjs";
import getSentinelController from "./sentinel.mjs";

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

  return {
    touched,
    townDevastated,
    dogsOutcome,
    banditsFate,
    helpfulFate,
    rathianFate: getRathianFate(),
    sentinelController: getSentinelController()
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

function getSentinelShadowSlides(state) {
  const image = "http://leponeyblanc.fr//media/uploads/news/5d90938b505c1.jpg"; // TODO: replace with Sentinel's shadow over Junkville art
  let slides = [];

  if (!state.townDevastated) {
    switch (state.sentinelController) {
    case "overmare":
      slides.push({
        image,
        subtitle: "Stable 103's Republic came calling within a few years, offering roads, protection, and a seat at a table Junkville had never known existed. Despite its inclination towards independent, the town took the deal, and eventually became one other cog in the newly born State.",
        duration: 9000
      });
      break ;
    case "rathian":
      slides.push({
        image,
        subtitle: "The New Crystal Empire", // TODO
        duration: 9000
      });
      break ;
    case "sombra":
      slides.push({
        image,
        subtitle: "The Crystal Empire", // TODO
        duration: 9000
      });
      break ;
    }
  }
  if (state.sentinelController === "rathian"
    && ["peace-trade", "peace-boundary", "dolly-coldwar", "unresolved"].includes(state.dogsOutcome)) {
    slides.push({
      image,
      subtitle: "Whatever peace, truce, or cold war Junkville had settled into with the diamond dogs, it didn't survive Rathian taking Sentinel. The gems were a strategic resources, and couldn't be handled by untrustworthy Diamond Dogs. After centuries of respite, the old world finally caught up to the Diamond Dogs, playing out the tragic fate that had always been theirs",
      duration: 9000
    });
  }
  return slides;
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
  else if (state.sentinelController == "rathian" || state.sentinelController == "sombra")
    return [];
  else if (state.dogsOutcome === "peace-trade")
    subtitle = "Junkville kept growing, scrap heap by scrap heap, one trade caravan at a time - proof that even in the wasteland, some things could still be built instead of just scavenged.";
  else
    subtitle = "Junkville endured, the way it always had: stubbornly, scrappily, one more day at a time.";

  return [{ image, subtitle, duration: 8000 }];
}

export default function getJunkvilleSlides() {
  const state = getJunkvilleEndingState();
  const relevant = state.sentinelController !== "rathian";
  let slides = [];

  if (state.touched) {
    slides = getSentinelShadowSlides(state);
    if (state.sentinelController !== "rathian")
      slides = [...slides, ...getJunkvilleDogsSlides(state)];
    else {
      slides = [
        ...slides,
        ...getJunkvilleBanditsSlides(state),
        ...getJunkvilleHelpfulSlides(state),
        ...getJunkvilleRathianSlides(state),
        ...getJunkvilleCodaSlide(state)
      ];
    }
  }
  return slides;
}
