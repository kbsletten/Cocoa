const Discord = require("discord.js");
const Command = require("./command");
const { check } = require("../../coc/game");

class CheckCommand extends Command {
  static getOptions() {
    return [
      {
        name: "value",
        type: Discord.Constants.ApplicationCommandOptionTypes.INTEGER,
        description: "The skill value (%).",
        required: true,
        minValue: 0,
        maxValue: 99,
      },
      {
        name: "skill",
        type: Discord.Constants.ApplicationCommandOptionTypes.STRING,
        description: "The name of the skill.",
      },
      {
        name: "bonus",
        type: Discord.Constants.ApplicationCommandOptionTypes.INTEGER,
        description: "How many bonus dice to apply.",
        minValue: 0,
        maxValue: 5,
      },
      {
        name: "penalty",
        type: Discord.Constants.ApplicationCommandOptionTypes.INTEGER,
        description: "How many penalty dice to apply.",
        minValue: 0,
        maxValue: 5,
      },
    ];
  }

  async processCommand() {
    const character = await this.DB.getCharacter(
      this.msg.guild.id,
      this.msg.member.id
    );
    const name = character?.Name ?? (await this.getAuthorDisplayName());
    const skill = this.expr.skill ?? "an Unknown Skill";
    const bonus = (this.expr.bonus ?? 0) - (this.expr.penalty ?? 0);
    const value = this.expr.value;
    const modifiers =
      bonus > 0 ? `, Bonus: ${bonus}` : bonus < 0 ? `, Penalty: ${-bonus}` : "";
    const { message, result } = check(value, bonus);
    return `${name} attempts ${skill} (${value}%${modifiers})!
${message}; **${result}!**`;
  }

  async getAuthorDisplayName() {
    const member = await this.msg.guild.members.fetch(this.msg.member);
    return member ? member.nickname : this.msg.member.username;
  }
}

module.exports = CheckCommand;
