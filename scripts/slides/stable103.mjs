import getRathianFate from "./rathian.mjs";
import {SentinelOutcome} from "../characters/rathian/flags.mjs";

function rathianDiedBeforeSentinelPlotline() {
  return !game.quests.hasQuest("stable-103/rathian");
}

function getStableEndingState() {
  const rathianQuest = game.quests.getQuest("stable-103/rathian");
  const gameEnding = game.getVariable("gameEnding", null);
  const sentinelOutcome = rathianQuest ? rathianQuest.getVariable("sentinelOutcome", 0) : 0;
  const rathianFate = getRathianFate(rathianQuest);
  const rathianClaimedSentinel = sentinelOutcome === SentinelOutcome.AppliedToRathian;
  const overmareAlive = game.getVariable("overmareDead", 0) == 0;
  const sentinelLeftUntouched = gameEnding == null || gameEnding == "stable-betrayed" || gameEnding === "stable-opened";

  // NOTE: guessed flag name - nothing in what's been built so far ever
  // sets this. Whichever quest eventually lets the player tip off the
  // Steel Rangers about Sentinel should set it.
  const steelRangersWarned = game.hasVariable("steelRangersWarnedAboutSentinel");

  return {
    gameEnding,
    sentinelOutcome,
    rathianFate,
    rathianClaimedSentinel,
    overmareAlive,
    sentinelLeftUntouched,
    steelRangersWarned
  };
}

function getStableSentinelSlides(state) {
  const image = "http://leponeyblanc.fr//media/uploads/news/5d90938b505c1.jpg"; // TODO: replace with Sentinel art
  const texts = {
    "sentinel-overmare": "Sentinel woke for the first time in centuries, and answered exactly as it was built to: to the Overmare, and through her, to Stable 103. The robots that had slept alongside it took their places at last, ready to make good on a hundred-year-old promise.",
    "sentinel-player": state.overmareAlive
      ? "Sentinel woke, and chose to answer to you. The Overmare stepped aside, whatever she truly felt about it kept carefully to herself, and an army built for a purpose nopony alive still remembered finally had somepony to serve."
      : "Sentinel woke to a master who'd taken it by force. Whatever it was originally built to become was yours to decide now, with nopony left who remembered it any other way.",
    "sentinel-rathian": "Sentinel woke for the first time in centuries. Under the command of Rathian, it conqueered the Crystal Wasteland, and helped him build an authoritarian state.",
    "sentinel-destroyed": "Sentinel was gone, and with it, any hope - or threat - of the old world ever coming back to claim the Crystal Wasteland. For better or for worse, its long forgotten promises are never to be fulfilled."
  };
  const subtitle = texts[state.gameEnding];

  if (subtitle != undefined)
    return [{ image, subtitle, duration: 8000 }];
  return [];
}

function getStableOvermareSlides(state) {
  const image = "http://leponeyblanc.fr//media/uploads/news/5d90938b505c1.jpg"; // TODO: replace with Overmare art
  let subtitle;

  if (state.overmareAlive) {
    switch (state.gameEnding) {
      case "sentinel-overmare":
        subtitle = "The Overmare took up the burden her predecessors had always refused. Whatever came of Sentinel from here, it would be on her terms, and her conscience.";
        break ;
      case "sentinel-player":
        subtitle = "The Overmare kept her seat in Stable 103, ruling over dwellers who never learned just how close their home had come to changing forever - or at whose hooves.";
        break ;
      case "stable-opened":
        subtitle = "The Overmare kept her office, and, for the first time in a hundred years, stopped pretending the world outside her door didn't exist.";
        break ;
      default:
        subtitle = "The Overmare remained exactly where she'd always been - ruling Stable 103 her way, certain, as ever, that she'd been right to keep it sealed.";
    }
  } else {
    return [];
    /*subtitle = state.gameEnding === "sentinel-destroyed"
      ? "The Overmare didn't survive the night Sentinel was destroyed in front of her. Whatever she'd have said about it, she never got the chance."
      : "The Overmare didn't survive. Stable 103 would need a new Overmare - one who, this time, might not let its secrets cost quite so much.";*/
  }

  return [{ image, subtitle, duration: 7000 }];
}

function getStableFutureSlides(state) {
  const image = "http://leponeyblanc.fr//media/uploads/news/5d90938b505c1.jpg"; // TODO: replace with Crystal Wasteland/future art

  switch (state.gameEnding) {
    case "sentinel-rathian":
      return [{
        image,
        subtitle: "With Sentinel's power, Rathian founded the New Crystal Empire. The Steel Rangers accepted the new statu-quo and joined the empire: they stopped hoarding what they knew and started teaching it. Within a few years, schools opened in settlements that had never seen one; within a decade, apprentices who'd once scavenged for scrap were fixing generators, filtering water, printing books. None of it came free - Rathian's word was law, and Sentinel's patrols made sure everypony remembered it - but for a wasteland that had spent generations losing knowledge instead of gaining it, order paid for with obedience was, for many ponies, still worth the price.",
        duration: 20000
      }];

    case "sentinel-overmare":
      return [{
        image,
        subtitle: "With Sentinel's protection, Stable 103 stopped merely surviving the Crystal Wasteland and started shaping it. Trade routes bent toward its gates; smaller settlements, tired of scraping by alone, petitioned to join what the Overmare began calling the Republic. It wasn't democracy, not quite - a seat at the table cost caps, contracts, or leverage, and the old Stable families kept most of it - but it was stability, infrastructure, and safety on a scale the wasteland hadn't seen since before the War, and for many, that was enough to call it home.",
        duration: 15000
      }];

    case "sentinel-player":
      if (game.player.getBuff("dark-magic-buff") != null) {
        return [{
          image,
          subtitle: "At first, it looked like victory. Sentinel's army secured the Crystal Wasteland town by town, and for a while, the ponies who'd feared it started to breathe easier. But something changed within you, slowly. You became known as a cruel King, ruling through tyranny, and while you resurrected the Crystal Empire, ponies sometimes remembered fondly of the old chaotic wasteland. Some crowns remember whoever wore them last, and are patient enough to wait for somepony new.",
          duration: 20000
        }];
      }
      return [{
        image,
        subtitle: "What became of Sentinel, and of you, was never fully written down - not in any account that survived, at least. Rumors travelled faster and further than facts ever could: a protector, a warlord, a ghost story told to frighten foals, depending on who was doing the telling, and how far from Stable 103 they lived. Whatever you built with Sentinel at your side, only you would ever really know the whole of it.",
        duration: 11000
      }];

    case "sentinel-destroyed":
      return [{
        image,
        subtitle: "Without Sentinel, and without the Overmare who might have decided its fate, Stable 103 fell to whoever could hold onto her office next. The door survived. What waited behind it, from then on, was up to whichever Overmare came after her.",
        duration: 9000
      }];

    case "stable-opened":
      return [{
        image,
        subtitle: "With your help, the Overmare built relationships with the neighboring communities, and turned the Stable into a booming provider of arts and technology for the whole Crystal Wasteland.",
        duration: 8000
      }];

    default:
      return [{
        image,
        subtitle: "Stable 103 stayed exactly as it had always been: sealed, hidden, and closed - to you as well, for good. Whatever became of it after that, you'd never be let back in to see.",
        duration: 7000
      }];
  }
}

function getStableEpilogueSlides(state) {
  if (!state.sentinelLeftUntouched)
    return [];


  if (state.steelRangersWarned) {
    const image = "http://leponeyblanc.fr//media/uploads/news/5d90938b505c1.jpg"; // TODO: replace with Steel Rangers/Stable 103 exterior art
    return [{
      image,
      subtitle: "Word of Sentinel reached the Steel Rangers eventually, and they came to collect it. Stable 103 fell to them without much of a fight. They never woke it either - not yet, anyway - but it belonged to them now, and maybe, someday, they'd change their mind. The dwellers who survived the takeover scattered into the wasteland; most found their way to Junkville, and, piece by piece, helped turn a dumpster into a town.",
      duration: 9000
    }];
  } else {
    return [];
  }
}

// Some slide for the future of the stable as stable-opened with sentinel not activated
// With your help, she built relationships with the neighboring communities, and turned the Stable into a booming provider of arts and technology for the whole Crystal Wasteland.

export default function getStableSlides() {
  if (rathianDiedBeforeSentinelPlotline()) {
    return [{
      image: "http://leponeyblanc.fr//media/uploads/news/5d90938b505c1.jpg", // TODO: replace with Celestial Device homecoming art
      subtitle: "You brought the Celestial Device home, saving it from a slow death from starvation. If the wasteland had anything else in store for you, you managed to safely slip by it.",
      duration: 8000
    }];
  }

  const state = getStableEndingState();

  return [
    ...getStableSentinelSlides(state),
    ...getStableOvermareSlides(state),
    ...getStableFutureSlides(state),
    ...getStableEpilogueSlides(state)
  ];
}
