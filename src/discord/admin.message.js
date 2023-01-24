const { cocoaClient } = require("./cocoaClient");
const parser = require("../parser/adminCommand.gen");
const DB = require("../db");
const { isAdmin } = require("./admin");
const { getServerSettingsMessage } = require("./getServerSettingsMessage");

cocoaClient.on("messageCreate", async (msg) => {
  if (msg.author.bot || !isAdmin(msg)) {
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
    const serverSettings = await DB.getServerSettings(msg.guild.id);
    switch (expr.adminCommand) {
      case "server settings": {
        await msg.reply(getServerSettingsMessage(serverSettings));
        break;
      }
      case "admin channel": {
        const isAdminChannel =
          msg.channel.id === serverSettings.Data.AdminChannel;
        serverSettings.Data.AdminChannel = isAdminChannel
          ? undefined
          : msg.channel.id;
        await DB.updateServerSettings(msg.guild.id, serverSettings.Data);
        await msg.reply(
          isAdminChannel
            ? `Admin channel un-set.`
            : `You will receive admin messages in this channel.`
        );
        break;
      }
      default: {
        break;
      }
    }
  } catch (e) {
    await msg.reply(
      `:head_bandage: I'm really sorry, but something has gone terribly wrong.`
    );
    console.error("Failed to process message", e);
  }
});
