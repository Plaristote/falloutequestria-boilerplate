import {getAttitude, DEFAULT_ATTITUDE} from "./target-attitudes.mjs";

function evaluateWeaponDanger(character) {
  const weapon = character.inventory?.getEquippedItem("use-1");
  if (!weapon || !weapon.script?.getDamageRange)
    return 0;
  const [min, max] = weapon.script.getDamageRange();
  return (min + max) / 2;
}

export default class TargetSelector {
  constructor(parent) {
    this.parent = parent;
    this.model = parent.model;
  }

  get threatTable() { return this.parent.threatTable; }
  get logPrefix()   { return this.parent.logPrefix; }

  get attitude() {
    return getAttitude(this.parent.targetAttitude || DEFAULT_ATTITUDE);
  }

  get judgementModel() {
    return this.parent.judgementSource || this.model;
  }

  // Perception-based capacity to read the battlefield
  get judgementNoise() {
    const perception = this.judgementModel.statistics?.perception ?? 10;
    return Math.max(0, (10 - perception) / 10) * 0.6; // 0 (sharp) .. 0.6 (dull)
  }

  // Intelligence-based capacity to make consistant choices
  get switchMargin() {
    const intelligence = this.judgementModel.statistics?.intelligence ?? 10;
    const intelligenceFactor = 0.5 + (intelligence / 10) * 0.5; // 0.55 .. 1.0
    return this.attitude.switchMargin * intelligenceFactor;
  }

  isTargetInRange(target) {
    const weapon1 = this.model.inventory.getEquippedItem("use-1");
    const weapon2 = this.model.inventory.getEquippedItem("use-2");
    return (weapon1 && weapon1.isInRange(target))
        || (weapon2 && weapon2.isInRange(target));
  }

  getCandidates() {
    const enemies = this.model.fieldOfView.getEnemies();
    let inRange = [];
    let others  = [];

    console.log(this.logPrefix, "Detected enemies:", enemies, enemies.length);
    for (let i = 0 ; i < enemies.length ; ++i) {
      if (!enemies[i].isAlive()) continue ;
      (this.isTargetInRange(enemies[i]) ? inRange : others).push(enemies[i]);
    }
    return { inRange, others, all: inRange.length > 0 ? inRange : others };
  }

  scoreCandidate(candidate) {
    if (!candidate) return -Infinity;
    const weights = this.attitude;
    const distance = this.model.getDistance(candidate);
    const hpPercentage = candidate.statistics ? candidate.statistics.hpPercentage : 100;

    const score = this.threatTable.get(candidate) * weights.threat
      + Math.max(0, weights.proximityRange - distance) * weights.proximity
      + Math.max(0, 100 - hpPercentage) * weights.vulnerability
      + evaluateWeaponDanger(candidate) * weights.weaponDanger
      + (this.isTargetInRange(candidate) ? weights.inRangeBonus : 0);

    return this.applyJudgementNoise(score);
  }

  applyJudgementNoise(score) {
    const noise = this.judgementNoise;
    if (noise <= 0)
      return score;
    const jitter = 1 + (Math.random() * 2 - 1) * noise; // Random multiplier centered on 1, spread grows the dumber the NPC is
    return score * jitter;
  }

  pickBest(candidates) {
    let target = candidates[0];
    let score = this.scoreCandidate(target);

    for (let i = 1 ; i < candidates.length ; ++i) {
      const candidateScore = this.scoreCandidate(candidates[i]);
      if (candidateScore > score) {
        target = candidates[i];
        score = candidateScore;
      }
    }
    console.log(this.logPrefix, "best candidate", target, "score", score);
    return { target, score };
  }

  findTarget() {
    const { inRange, others, all } = this.getCandidates();
    if (all.length === 0)
      return null;
    if (inRange.length === 0)
      console.log(this.logPrefix, "No enemy in weapon range");
    return this.pickBest(all);
  }

  pickTarget() {
    const result = this.findTarget();
    return result ? result.target : null;
  }

  reconsider(currentTarget) {
    const best = this.findTarget();
    if (!best || best.target === currentTarget)
      return currentTarget;

    const currentScore = this.scoreCandidate(currentTarget);
    if (best.score > currentScore * this.switchMargin) {
      console.log(this.logPrefix, "switching target", currentTarget, "->", best.target,
        `(${currentScore.toFixed(1)} -> ${best.score.toFixed(1)})`);
      return best.target;
    }
    return currentTarget;
  }
}
