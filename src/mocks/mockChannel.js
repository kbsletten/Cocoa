const { v4: uuid } = require("uuid");

class MockChannel {
    constructor() {
        this.id = uuid();
    }
}

module.exports = MockChannel;