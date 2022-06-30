const { v4: uuid } = require("uuid");
const MockUser = require("./mockUser");

class MockGuild {
  constructor(id = undefined) {
    this.id = uuid();
    this.members = {
      fetch: async function () {
        return new MockUser();
      },
    };
  }
}

module.exports = MockGuild;
