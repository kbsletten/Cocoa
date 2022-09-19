const Discord = require("discord.js");
const { cocoaClient } = require("./cocoaClient");

const commands = [
  {
    name: "cocoa",
    description: "Run a Cocoa command.",
    options: [
      {
        name: "command",
        type: Discord.Constants.ApplicationCommandOptionTypes.STRING,
        description: "The Cocoa command to run.",
      },
    ],
  },
];

cocoaClient.application.commands
  .set(commands)
  .catch(console.error);
