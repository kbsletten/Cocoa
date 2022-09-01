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
      new Discord.MessageActionRow({
        components: [
          new Discord.MessageSelectMenu({
            customId: `admin:serverSettings:Karma`,
            placeholder: `Enable karmic rerolls`,
            options: [
              {
                label: `Karma: On`,
                value: "On",
                default: serverSettings.Data.Karma === "On",
              },
              {
                label: `Karma: Off`,
                value: "Off",
                default: serverSettings.Data.Karma === "Off",
              },
            ],
          }),
        ],
      }),
      new Discord.MessageActionRow({
        components: [
          new Discord.MessageSelectMenu({
            customId: `admin:serverSettings:Mark`,
            placeholder: `Enable automatic marking of skills`,
            options: [
              {
                label: `Mark: Manual`,
                value: "Manual",
                default: serverSettings.Data.Mark === "Manual"
              },
              {
                label: `Mark: Auto`,
                value: "Auto",
                default: serverSettings.Data.Mark === "Auto"
              },
              {
                label: `Mark: Always`,
                value: "Always",
                default: serverSettings.Data.Mark === "Always"
              },
            ]
          })
        ]
      })
    ],
  };
}

module.exports = {
  getServerSettingsMessage,
};
