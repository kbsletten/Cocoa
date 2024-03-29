const { v4: uuid } = require("uuid");

const MockGuild = require("./mockGuild");
const MockUser = require("./mockUser");
const MockMember = require("./mockMember");
const MockChannel = require("./mockChannel");

class MockMessage {
  constructor(content, bot = false, isOwner = false) {
    const userId = uuid();

    this.guild = new MockGuild(undefined, isOwner ? userId : null);
    this.channel = new MockChannel();
    this.author = new MockUser(userId, bot);
    this.member = new MockMember(userId);
    this.content = content;
    this.reply = jest.fn();
  }
}

module.exports = MockMessage;
