const { getEditMessage } = require("../getEditMessage");
const CharacterCommand = require("./characterCommand");

class EditCharacterCommand extends CharacterCommand {
  async processCharacterCommand() {
    return getEditMessage(this.game, this.character);
  }
}

module.exports = EditCharacterCommand;
