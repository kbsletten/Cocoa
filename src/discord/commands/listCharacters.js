const Command = require("./command");

class ListCharactersCommand extends Command {
  async processCommand() {
    const characters = await this.DB.listCharacters(
      this.msg.guild.id,
      this.msg.author.id
    );
    if (!characters.length)
      return `Whoops! You don't have any characters yet. Try "new character".`;
    return `Here are your characters: ${characters
      .map((it) => it.Name)
      .join(", ")}`;
  }
}

module.exports = ListCharactersCommand;
