const { v4: uuid } = require("uuid");

class MockUser {
    constructor(id = undefined, bot = false) {
        this.id = id ?? uuid();
        this.bot = bot;
        this.nickname = "Test Nickname";
        this.username = "Test Username";
    }
}

module.exports = MockUser;
