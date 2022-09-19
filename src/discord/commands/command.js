const { GAMES } = require("../../coc/data");

class Command {
  constructor(msg, expr, DB) {
    this.msg = msg;
    this.expr = expr;
    this.DB = DB;
  }

  async process() {
    try {
      this.serverSettings = await this.DB.getServerSettings(this.msg.guild.id);
      this.game = GAMES[this.serverSettings.Data["Game"] ?? "CORE"];
      const reply = await this.processCommand();
      await this.msg.reply(reply);
    } catch (e) {
      await this.msg.reply(
        `:head_bandage: I'm really sorry, but something has gone terribly wrong.`
      );
      console.error("Failed to process message", e);
    }
  }

  async processCommand() {
    throw new Error("Not implemented.");
  }

  getOptions() {
    return [];
  }

  async notifyAdmin(...msg) {
    if (this.serverSettings.Data.AdminChannel) {
      const channel = this.msg.client.channels.cache.get(
        this.serverSettings.Data.AdminChannel
      );
      if (channel) {
        await channel.send(...msg);
      }
    }
  }
}

module.exports = Command;
