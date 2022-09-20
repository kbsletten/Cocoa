const Discord = require("discord.js");
const Option = require('./option');

class StringOption extends Option {
  constructor(name, description) {
    super(
      Discord.Constants.ApplicationCommandOptionTypes.STRING,
      name,
      description
    );
  }
  parse(interaction, expr) {
    expr[this.name] = interaction.options.getString(this.name);
  }
}

module.exports = StringOption;
