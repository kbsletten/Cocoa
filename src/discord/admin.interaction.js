const { cocoaClient } = require("./cocoaClient");
const DB = require("../db");
const { isAdmin } = require("./admin");
const { getServerSettingsMessage } = require("./getServerSettingsMessage");

cocoaClient.on("interactionCreate", async (interaction) => {
  if (interaction.isCommand() || !isAdmin(interaction)) {
    return;
  }
  const serverSettings = await DB.getServerSettings(interaction.guild.id);
  try {
    const [admin, command, operation, value] = interaction.customId.split(
      ":",
      4
    );
    if (admin !== "admin") {
      return;
    }
    switch (command) {
      case "serverSettings": {
        serverSettings.Data[operation] = interaction.isSelectMenu()
          ? interaction.values[0]
          : value;
        await DB.updateServerSettings(
          serverSettings.ServerId,
          serverSettings.Data
        );
        interaction.update(getServerSettingsMessage(serverSettings));
        break;
      }
    }
  } catch (e) {
    console.error(`Failed to process interaction`, e);
  }
});
