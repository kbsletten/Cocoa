const Command = require("./command");
const { listStats, listSkills } = require("../../coc/game");

class ListServerCharactersCommand extends Command {
  async processCommand() {
    const characters = await this.DB.listCharacters(this.msg.guild.id);
    if (!characters.length)
      return `Whoops! You don't have any characters yet. Try "new character".`;
    const details = characters.map(
      (character) =>
        `**${character.Name}**
${listStats(character)}
${Object.entries(character.Data.Characteristics)
  .map(([char, value]) => `${char}: ${value}`)
  .join(", ")}
Skills: ${listSkills(this.game, character)}`
    );
    return `Here are all the characters on the server:

${details.join("\n\n")}`;
  }
}

module.exports = ListServerCharactersCommand;
