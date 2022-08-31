const Discord = require("discord.js");
const { cocoaClient } = require("./cocoaClient");
const parser = require("../parser/command.gen");
const DB = require("../db");
const {
  check,
  d6,
  die,
  findSkill,
  getSkill,
  improve,
  listSkills,
  listStats,
  modify,
} = require("../coc/game");
const { GAMES, STATS } = require("../coc/data");
const { choice } = require("./choice");
const { loadFile } = require("../file");
const NewCharacterCommand = require("./commands/newCharacter");
const EditCharacterCommand = require("./commands/editCharacter");
const RenameCharacterCommand = require("./commands/renameCharacter");
const DeleteCharacterCommand = require("./commands/deleteCharacter");
const ListServerCharactersCommand = require("./commands/listServerCharacters");
const ListCharactersCommand = require("./commands/listCharacters");
const SkillRollCommand = require("./commands/skillRoll");

async function getAuthorDisplayName(msg) {
  const member = await msg.guild.members.fetch(msg.author);
  return member ? member.nickname : msg.author.username;
}

async function getCurrentCharacter(msg, expr) {
  const character = await DB.getCharacter(msg.guild.id, msg.author.id);
  if (character) {
    return character;
  }
  await msg.reply(
    `Whoops! You don't have any characters yet. Try "new character".`
  );
  return null;
}

async function getSkillClarify(msg, game, character, skillName, ...params) {
  const { error, skillOptions, ...results } = findSkill(
    game,
    character,
    skillName,
    ...params
  );
  return await new Promise(async (resolve) => {
    if (skillOptions) {
      const skill = await choice(
        msg,
        error,
        skillOptions.map((skill) => {
          return { label: skill, value: skill };
        })
      );
      return resolve(getSkill(game, character, skill, ...params));
    }
    if (error) {
      await msg.reply(error);
      return resolve({ error });
    }
    return resolve(results);
  });
}

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
  async function replyNoCharacter() {
    await msg.reply(
      `Whoops! You don't have any characters yet. Try "new character".`
    );
  }
  const serverSettings = await DB.getServerSettings(msg.guild.id);
  const game = GAMES[serverSettings.Data["Game"] ?? "CORE"];
  async function notifyAdmin(...msg) {
    if (serverSettings.Data.AdminChannel) {
      const channel = cocoaClient.channels.cache.get(
        serverSettings.Data.AdminChannel
      );
      if (channel) {
        await channel.send(...msg);
      }
    }
  }
  async function checkKarma(character, success) {
    if (serverSettings.Data.Karma !== "On") {
      return false;
    }
    if (
      success <= 0 &&
      Math.random() * 100 < (character.Data.Meta?.Karma ?? 0)
    ) {
      await notifyAdmin(
        `${character.Name} got a karmic reroll (Karma: ${character.Data.Meta.Karma})`
      );
      return true;
    }
    if (success > 0) {
      character.Data.Meta.Karma = 0;
    } else {
      character.Data.Meta.Karma += success < 0 ? 15 : 5;
    }
    await notifyAdmin(
      `${character.Name}'s Karma updated: ${character.Data.Meta.Karma}`
    );
    await DB.updateCharacterData(character.CharacterId, character.Data);
    return false;
  }
  try {
    const commands = {
      "new character": NewCharacterCommand,
      "edit character": EditCharacterCommand,
      "rename character": RenameCharacterCommand,
      "delete character": DeleteCharacterCommand,
      "list server characters": ListServerCharactersCommand,
      "list characters": ListCharactersCommand,
      "skill roll": SkillRollCommand,
    }
    const Command = commands[expr.command]
    if (Command) {
      await new Command(msg, expr, DB).process();
      return;
    }
    switch (expr.command) {
      case "check": {
        const character = await DB.getCharacter(msg.guild.id, msg.author.id);
        const name = character?.Name ?? (await getAuthorDisplayName(msg));
        const skill = expr.skill ?? "an Unknown Skill";
        const bonus = expr.bonus - expr.penalty;
        const value = expr.value;
        const modifiers =
          bonus > 0
            ? `, Bonus: ${bonus}`
            : bonus < 0
            ? `, Penalty: ${-bonus}`
            : "";
        const { error, message, result } = check(value, bonus);
        await msg.reply(
          error ??
            `${name} attempts ${skill} (${value}%${modifiers})!
${message}; **${result}!**`
        );
        break;
      }
      case "roll": {
        const result = die(
          expr.dice.sides,
          expr.dice.number,
          expr.dice.add,
          expr.dice.multiply
        );
        await msg.reply(`${result.display} = ${result.total}`);
        break;
      }
      case "hp": {
        const character = await getCurrentCharacter(msg, expr);
        if (!character) return await replyNoCharacter();
        const maxHP = STATS.HP.max(character);
        const prevHP = character.Data.Stats.HP ?? STATS.HP.default(character);
        const { value: nextHP, display } = modify(
          prevHP,
          maxHP,
          expr.add,
          expr.set
        );
        if (nextHP !== prevHP) {
          character.Data.Stats.HP = nextHP;
          await DB.updateCharacterData(character.CharacterId, character.Data);
        }
        await msg.reply(`${character.Name}'s HP: ${display}`);
        break;
      }
      case "sanity": {
        const character = await getCurrentCharacter(msg, expr);
        if (!character) return await replyNoCharacter();
        const maxSan = STATS.Sanity.max(character);
        const prevSan =
          character.Data.Stats.Sanity ?? STATS.Sanity.default(character);
        const { value: nextSan, display } = modify(
          prevSan,
          maxSan,
          expr.add,
          expr.set
        );
        if (nextSan !== prevSan) {
          character.Data.Stats.Sanity = nextSan;
          await DB.updateCharacterData(character.CharacterId, character.Data);
        }
        await msg.reply(`${character.Name}'s Sanity: ${display}`);
        break;
      }
      case "luck": {
        const character = await getCurrentCharacter(msg, expr);
        if (!character) return await replyNoCharacter();
        const maxLuck = STATS.Luck.max(character);
        const prevLuck =
          character.Data.Stats.Luck ?? STATS.Luck.default(character);
        const { value: nextLuck, display } = modify(
          prevLuck,
          maxLuck,
          expr.add,
          expr.set
        );
        if (nextLuck !== prevLuck) {
          character.Data.Stats.Luck = nextLuck;
          await DB.updateCharacterData(character.CharacterId, character.Data);
        }
        await msg.reply(`${character.Name}'s Luck: ${display}`);
        break;
      }
      case "magic": {
        const character = await getCurrentCharacter(msg, expr);
        if (!character) return await replyNoCharacter();
        const maxMP = STATS.MP.max(character);
        const prevMP = character.Data.Stats.MP ?? STATS.MP.default(character);
        const { value: nextMP, display } = modify(
          prevMP,
          maxMP,
          expr.add,
          expr.set
        );
        if (nextMP !== prevMP) {
          character.Data.Stats.MP = nextMP;
          await DB.updateCharacterData(character.CharacterId, character.Data);
        }
        await msg.reply(`${character.Name}'s MP: ${display}`);
        break;
      }
      case "mark": {
        const character = await getCurrentCharacter(msg, expr);
        if (!character) return await replyNoCharacter();
        const { skill, value, error } = await getSkillClarify(
          msg,
          game,
          character,
          expr.skill,
          false
        );
        if (skill && !character.Data.Improvements.includes(skill)) {
          character.Data.Improvements = [...character.Data.Improvements, skill];
          await DB.updateCharacterData(character.CharacterId, character.Data);
        }
        await msg.reply(
          error ??
            `${character.Name}'s skill, ${skill} (${value}%) is marked for improvement!`
        );
        break;
      }
      case "reset mark": {
        const character = await getCurrentCharacter(msg, expr);
        if (!character) return await replyNoCharacter();
        const { skill, value, error } = await getSkillClarify(
          msg,
          game,
          character,
          expr.skill,
          false
        );
        if (skill && character.Data.Improvements.includes(skill)) {
          character.Data.Improvements = character.Data.Improvements.filter(
            (it) => it !== skill
          );
          await DB.updateCharacterData(character.CharacterId, character.Data);
        }
        await msg.reply(
          error ??
            `${character.Name}'s skill, ${skill} (${value}%) is not marked for improvement!`
        );
        break;
      }
      case "improve": {
        const character = await getCurrentCharacter(msg, expr);
        if (!character) return await replyNoCharacter();
        let improvements = character.Data.Improvements;
        if (expr.skill) {
          const { skill, error } = await getSkillClarify(
            msg,
            game,
            character,
            expr.skill,
            false
          );
          if (error) {
            await msg.reply(error);
            return;
          }
          improvements = [skill];
        }
        const results = [];
        for (const skill_name of improvements.filter(
          (it, index) => index === improvements.indexOf(it)
        )) {
          const { skill, value, error } = await findSkill(
            game,
            character,
            skill_name,
            false
          );
          if (error) {
            continue;
          }
          const { success, message } = check(value);
          let display = "No improvement.";
          if (success < 1) {
            display = `Improvement: ${improve(game, character, skill).display}`;
          }
          results.push(`**${skill} (${value}%)**: ${message}
${display}`);
        }
        character.Data.Improvements = character.Data.Improvements.filter(
          (it) => !improvements.includes(it)
        );
        await DB.updateCharacterData(character.CharacterId, character.Data);

        await msg.reply(
          results.join("\n\n") || `No skills marked for improvement.`
        );
        break;
      }
      case "stats": {
        const character = await getCurrentCharacter(msg, expr);
        if (!character) return await replyNoCharacter();
        await msg.reply(`**${character.Name}** ${listStats(character)}`);
        break;
      }
      case "set skill": {
        const character = await getCurrentCharacter(msg, expr);
        if (!character) return await replyNoCharacter();
        const { skill, error } = expr.custom
          ? { skill: expr.skill }
          : await getSkillClarify(msg, game, character, expr.skill);
        if (error) {
          await msg.reply(error);
          break;
        }
        character.Data.Skills[skill] = Math.min(99, Math.max(0, expr.value));
        await DB.updateCharacterData(character.CharacterId, character.Data);
        await msg.reply(listSkills(game, character));
        break;
      }
      case "reset skill": {
        const character = await getCurrentCharacter(msg, expr);
        if (!character) return await replyNoCharacter();
        const { skill, error } = await getSkillClarify(
          msg,
          game,
          character,
          expr.skill,
          false,
          false
        );
        if (error) {
          return;
        }
        delete character.Data.Skills[skill];
        await DB.updateCharacterData(character.CharacterId, character.Data);
        await msg.reply(listSkills(game, character));
        break;
      }
      case "sheet": {
        const character = await getCurrentCharacter(msg, expr);
        if (!character) return await replyNoCharacter();
        await msg.reply(
          `**${character.Name}**
Stats: ${listStats(character)}
Skills: ${listSkills(game, character)}`
        );
        break;
      }
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
  }
});
