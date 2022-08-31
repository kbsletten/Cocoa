const CharacterCommand = require("./characterCommand");

class RenameCharacterCommand extends CharacterCommand {
  async processCharacterCommand() {
    const oldName = this.character.Name;
    this.character.Name = this.expr.name;
    await this.DB.updateCharacterName(
      this.character.CharacterId,
      this.character.Name
    );
    return `Renamed ${oldName} to ${this.character.Name}`;
  }

  shouldUpdateCharacterData() {
    return false;
  }
}

module.exports = RenameCharacterCommand;
