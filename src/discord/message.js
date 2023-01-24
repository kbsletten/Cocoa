const { cocoaClient } = require("./cocoaClient");
const parser = require("../parser/command.gen");
const DB = require("../db");
const { loadFile } = require("../file");
const commands = require('./commands');

cocoaClient.on("messageCreate", async (msg) => {
  if (msg.author.bot) {
    return;
  }
  let expr;
  try {
    expr = parser.parse(msg.content);
  } catch {
    // ¯\_(ツ)_/¯
    return;
  }
  try {
    const Command = commands[expr.command];
    if (Command) {
      await new Command(msg, expr, DB).process();
      return;
    }
    switch (expr.command) {
      case "help": {
        const helpText = await loadFile(`help/${expr.help}.md`);
        await msg.reply(helpText);
        break;
      }
      default:
        await msg.reply(
          `I'm sorry, I don't understand "${expr.command}". Kyle will probably teach me soon.`
        );
        break;
    }
  } catch (e) {
    await msg.reply(
      `:head_bandage: I'm really sorry, but something has gone terribly wrong.`
    );
    console.error("Failed to process message", e);
    const owner = await cocoaClient.users.fetch(process.env.OWNER_ID);
    if (owner) {
      const dmChannel = owner.dmChannel ?? await owner.createDM();
      await dmChannel.send(`Error in ${msg.guild.id} for ${msg.member.id}:
${e}
${e.stack}`);
    }
  }
});
