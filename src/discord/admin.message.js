const { cocoaClient } = require("./cocoaClient");
const parser = require("../parser/adminCommand.gen");
const DB = require("../db");
const { isAdmin } = require("./admin");
const { getServerSettingsMessage } = require("./getServerSettingsMessage");

cocoaClient.on("messageCreate", async (msg) => {
  if (msg.author.bot) {
    console.log(`Hello, fellow bot!`);
    return;
  }
  if (!isAdmin(msg)) {
    console.log(`I'm not listening.`);
    return;
  }
  let expr;
  try {
    expr = parser.parse(msg.content);
  } catch (e) {
    // ¯\_(ツ)_/¯
    return;
  }
  try {
    console.log(`${msg.content} => ${JSON.stringify(expr)}`);
    const serverSettings = await DB.getServerSettings(msg.guild.id);
    switch (expr.adminCommand) {
      case "server settings": {
        msg.reply(getServerSettingsMessage(serverSettings));
        break;
      }
    }
  } catch (e) {
    msg.reply(
      `:head_bandage: I'm really sorry, but something has gone terribly wrong.`
    );
    console.error("Failed to process message", e);
  }
});
