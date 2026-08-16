import getStableSlides from "./stable103.mjs";
import getJunkvilleSlides from "./junkville.mjs";

export default function() {
  console.log("DEBUG: MAKE END GAME SLIDES CALLED");
  const result = [
    {
      image: "https://static.wikia.nocookie.net/falloutequestria/images/1/15/Equestrian_wasteland_by_idess-d3ins9f.jpg/revision/latest/scale-to-width-down/1000?cb=20110824114959",
      subtitle: "War. War never changes.",
      duration: 3200
    },
    {
      image: "http://leponeyblanc.fr//media/uploads/news/5d90938b505c1.jpg",
      subtitle: "But ponies do.",
      duration: 2700
    },
    ...getStableSlides(),
    ...getJunkvilleSlides()
  ];

  result.forEach(slide => {
    console.log("Slide -> ", slide.subtitle);
  });
  return result;
}
