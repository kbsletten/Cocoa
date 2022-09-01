const Command = require("./command");
const { check } = require("../../coc/game");

class CheckCommand extends Command {
  async processCommand() {
    const character = await this.DB.getCharacter(
      this.msg.guild.id,
      this.msg.author.id
    );
    const name = character?.Name ?? (await this.getAuthorDisplayName());
    const skill = this.expr.skill ?? "an Unknown Skill";
    const bonus = this.expr.bonus - this.expr.penalty;
    const value = this.expr.value;
    const modifiers =
      bonus > 0 ? `, Bonus: ${bonus}` : bonus < 0 ? `, Penalty: ${-bonus}` : "";
    const { message, result } = check(value, bonus);
    return (
      `${name} attempts ${skill} (${value}%${modifiers})!
${message}; **${result}!**`
    );
  }

  async getAuthorDisplayName() {
    const member = await this.msg.guild.members.fetch(this.msg.author);
    return member ? member.nickname : this.msg.author.username;
  }
}

module.exports = CheckCommand;
