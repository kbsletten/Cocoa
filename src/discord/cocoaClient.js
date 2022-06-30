const Discord = require("discord.js");

const cocoaClient = new Discord.Client({
  intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES],
});

cocoaClient.on("ready", () => {
  console.log(`Logged in as ${cocoaClient.user.tag}!`);
});

module.exports = { cocoaClient };
