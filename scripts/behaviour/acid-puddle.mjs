class AcidPuddle {
  constructor(model) {
    this.model = model;
  }
}

export function create(model) {
  return new AcidPuddle(model);
}