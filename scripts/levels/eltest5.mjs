export class Level {
  constructor(model) {
    this.model = model;

    if (!this.model.hasVariable("coucou2")) {
      this.model.setVariable("coucou2", true);
      this.model.tasks.addTask("testTask2", 1000, 0);
    }
  }

  testTask() {}

  testTask2() {
    const houseLight = level.tilemap.getLightLayer("house-light");

    houseLight.visible = !houseLight.visible;
  }
}

export function create(model) {
  return new Level(model);
}
