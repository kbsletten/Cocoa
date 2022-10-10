const Discord = require("discord.js");
const { cocoaClient } = require("./cocoaClient");
const { check } = require("./commands");

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
  {
    name: "check",
    description: "Roll a skill check.",
    options: check.getOptions(),
  }
];

cocoaClient.application.commands
  .set(commands)
  .catch(console.error);
