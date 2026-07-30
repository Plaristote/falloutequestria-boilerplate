export default function killArray(array) {
  array.forEach(character => {
    character.takeDamage(character.statistics.hitPoints, null);
  });
}
