const { v4: uuid } = require("uuid");

class MockMember {
  constructor(id = undefined, roles = []) {
    this.id = id ?? uuid();
    this.roles = {
      cache: [],
    };
  }
}

module.exports = MockMember;
