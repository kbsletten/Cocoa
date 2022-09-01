const { cocoaClient } = require("./cocoaClient");
const parser = require("../parser/command.gen");
const DB = require("../db");
const { loadFile } = require("../file");
const NewCharacterCommand = require("./commands/newCharacter");
const EditCharacterCommand = require("./commands/editCharacter");
const RenameCharacterCommand = require("./commands/renameCharacter");
const DeleteCharacterCommand = require("./commands/deleteCharacter");
const ListServerCharactersCommand = require("./commands/listServerCharacters");
const ListCharactersCommand = require("./commands/listCharacters");
const SkillRollCommand = require("./commands/skillRoll");
const CheckCommand = require("./commands/check");
const RollCommand = require("./commands/roll");
const StatCommand = require("./commands/stat");
const MarkCommand = require("./commands/mark");
const ResetMarkCommand = require("./commands/resetMark");
const ImproveCommand = require("./commands/improve");
const StatsCommand = require("./commands/stats");
const SetSkillCommand = require("./commands/setSkill");
const ResetSkillCommand = require("./commands/resetSkill");
const SheetCommand = require("./commands/sheet");

cocoaClient.on("messageCreate", async (msg) => {
  if (msg.author.bot) {
    console.log(`Hello, fellow bot!`);
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
    const commands = {
      "check": CheckCommand,
      "delete character": DeleteCharacterCommand,
      "edit character": EditCharacterCommand,
      "improve": ImproveCommand,
      "list characters": ListCharactersCommand,
      "list server characters": ListServerCharactersCommand,
      "mark": MarkCommand,
      "new character": NewCharacterCommand,
      "rename character": RenameCharacterCommand,
      "reset mark": ResetMarkCommand,
      "reset skill": ResetSkillCommand,
      "roll": RollCommand,
      "set skill": SetSkillCommand,
      "sheet": SheetCommand,
      "skill roll": SkillRollCommand,
      "stat": StatCommand,
      "stats": StatsCommand,
    };
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
      await dmChannel.send(`Error in ${msg.guild.id} for ${msg.author.id}:
${e}
${e.stack}`);
    }
  }
});
