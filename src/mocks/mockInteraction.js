class MockInteraction {
  constructor(customId, values = undefined) {
    this.customId = customId;
    this.values = values;
    this.update = jest.fn();
  }

  isSelectMenu() {
    return Boolean(this.values);
  }
}

module.exports = MockInteraction;
