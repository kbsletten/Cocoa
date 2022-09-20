class Option {
  constructor(type, name, description) {
    this.type = type;
    this.name = name;
    this.description = description;
  }
  add(options) {
    options.push({
      name: this.name,
      type: this.type,
      description: this.description,
    });
  }
  parse(interaction, expr) {
    throw new Error(`Not implemented.`)
  }
}

module.exports = Option;
