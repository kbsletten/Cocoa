const { check, mod, move } = require("../../coc/game");
const Command = require("./command");

class InitiativeCommand extends Command {
  async processCommand() {
    const characters = await this.DB.listCharacters(this.msg.guild.id);
    if (!characters.length)
      return `Whoops! You don't have any characters yet. Try "new character".`;
    characters.sort(
      (c1, c2) => c2.Data.Characteristics.DEX - c1.Data.Characteristics.DEX
    );
    const withMove = characters.map((character) => {
      const { success, message } = check(character.Data.Characteristics.CON);
      const moveMod = success === 3 ? 1 : success < 1 ? -1 : 0;
      const baseMove = move(character);
      return {
        character,
        message,
        moveMod,
        baseMove,
      };
    });
    const moveFloor = Math.min(
      ...withMove.map(({ baseMove, moveMod }) => baseMove + moveMod - 1)
    );
    const details = withMove.map(
      ({ character, message, moveMod, baseMove }) => {
        return `**${character.Name}** (Init ${
          character.Data.Characteristics.DEX
        }, Move ${baseMove + moveMod - moveFloor})
CON (${character.Data.Characteristics.CON}%): ${message}${
          moveMod ? `; Move: ${mod(moveMod)}` : ""
        }
Move: ${baseMove}${mod(moveMod)} = ${baseMove + moveMod} -> ${
          baseMove + moveMod - moveFloor
        } movement action${
          baseMove + moveMod - 1 === moveFloor ? "" : "s"
        } / round`;
      }
    );
    return `Rolling initiative!
${details.join("\n\n")}`;
  }
}

module.exports = InitiativeCommand;
