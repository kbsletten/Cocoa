const MockGuild = require("./mockGuild");
const MockUser = require("./mockUser");

class MockMessage {
  constructor(content, bot = false) {
    this.guild = new MockGuild();
    this.author = new MockUser(undefined, bot);
    this.content = content;
    this.reply = jest.fn();
  }
}

module.exports = MockMessage;
