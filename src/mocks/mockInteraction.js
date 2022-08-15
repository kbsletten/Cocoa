const { v4: uuid } = require("uuid");
const MockGuild = require("./mockGuild");
const MockMember = require("./mockMember");

class MockInteraction {
  constructor(customId, values = undefined, isOwner = false) {
    const userId = uuid();

    this.customId = customId;
    this.values = values;
    this.update = jest.fn();
    this.guild = new MockGuild(undefined, isOwner ? userId : undefined);
    this.member = new MockMember(userId);
  }

  isSelectMenu() {
    return Boolean(this.values);
  }
}

module.exports = MockInteraction;
