export const targetMode = 1;

export const actionPointCost = 3;

export function use(character, target) {
  return true;
}

export function triggerUse(character, target) {
  target.addBuff("ko");
}
