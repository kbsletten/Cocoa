const CharacterCommand = require("./characterCommand");

class DeleteCharacterCommand extends CharacterCommand {
  async processCharacterCommand() {
    if (this.character.Name === this.expr.name) {
      await this.DB.deleteCharacter(this.character.CharacterId);
    }
    return `${this.character.Name} has been deleted.`;
  }
}

module.exports = DeleteCharacterCommand;
