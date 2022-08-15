const Discord = require("discord.js");
const { GAMES } = require("../coc/data");

function getServerSettingsMessage(serverSettings) {
  return {
    content: `Editing server settings...`,
    components: [
      new Discord.MessageActionRow({
        components: [
          new Discord.MessageSelectMenu({
            customId: `admin:serverSettings:Game`,
            placeholder: `Choose game`,
            options: Object.keys(GAMES).map((key) => {
              return {
                label: `Game: ${key}`,
                value: key,
                default: key === serverSettings.Data.Game,
              };
            }),
          }),
        ],
      }),
    ],
  };
}

module.exports = {
  getServerSettingsMessage,
};
