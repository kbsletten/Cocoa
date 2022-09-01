const CharacterCommand = require("./characterCommand");
const { listSkills, listStats } = require("../../coc/game");

class SheetCommand extends CharacterCommand {
  async processCharacterCommand() {
    return `**${this.character.Name}**
Stats: ${listStats(this.character)}
Skills: ${listSkills(this.game, this.character)}`;
  }
}

module.exports = SheetCommand;
