const Discord = require("discord.js");
const Command = require("./command");
const { d6 } = require("../../coc/game");

class NewCharacterCommand extends Command {
  async processCommand() {
    const characteristics = {
      STR: d6(3, { multiply: 5 }),
      CON: d6(3, { multiply: 5 }),
      SIZ: d6(2, { add: 6, multiply: 5 }),
      DEX: d6(3, { multiply: 5 }),
      APP: d6(3, { multiply: 5 }),
      INT: d6(2, { add: 6, multiply: 5 }),
      POW: d6(3, { multiply: 5 }),
      EDU: d6(2, { add: 6, multiply: 5 }),
    };
    const Luck = d6(3, { multiply: 5 });
    const character = {
      Name: this.expr.name ?? "New Character",
      Data: {
        Characteristics: {},
        Skills: {},
        Stats: { Luck: Luck.total },
        Meta: {},
      },
    };
    for (const [char, { total }] of Object.entries(characteristics)) {
      character.Data.Characteristics[char] = total;
    }
    await this.DB.createCharacter(
      this.msg.guild.id,
      this.msg.member.id,
      character.Name,
      JSON.stringify(character.Data)
    );
    return {
      content: `Created a new character named ${this.expr.name}!`,
      embeds: [
        new Discord.MessageEmbed({
          title: `Rolled stats for ${character.Name}!`,
          fields: Object.entries({ ...characteristics, Luck }).map(
            ([key, value]) => {
              return {
                name: key,
                value: `${value.display} = ${value.total}`,
                inline: true,
              };
            }
          ),
        }),
      ],
    };
  }
}

module.exports = NewCharacterCommand;
