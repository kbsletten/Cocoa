const CharacterCommand = require("./characterCommand");
const { listStats } = require("../../coc/game");

class StatsCommand extends CharacterCommand {
  async processCharacterCommand() {
    return `**${this.character.Name}** ${listStats(this.character)}`;
  }
}

module.exports = StatsCommand;
