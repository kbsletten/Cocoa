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
const { getEditMessage } = require("./getEditMessage");
const { choice } = require("./choice");
const { loadFile } = require("../file");

async function getAuthorDisplayName(msg) {
  const member = await msg.guild.members.fetch(msg.author);
  return member ? member.nickname : msg.author.username;
}

async function getCurrentCharacter(msg, expr) {
  const character = await DB.getCharacter(msg.guild.id, msg.author.id);
  if (character) {
    return character;
  }
  msg.reply(`Whoops! You don't have any characters yet. Try "new character".`);
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
  function replyNoCharacter() {
    msg.reply(
      `Whoops! You don't have any characters yet. Try "new character".`
    );
  }
  const serverSettings = await DB.getServerSettings(msg.guild.id);
  const game = GAMES[serverSettings.Data["Game"] ?? "CORE"];
  try {
    console.log(`${msg.content} => ${JSON.stringify(expr)}`);
    switch (expr.command) {
      case "new character":
        const characteristics = {
          STR: d6(3, { multiply: 5 }),
          CON: d6(3, { multiply: 5 }),
          SIZ: d6(2, { add: 6, multiply: 5 }),
          DEX: d6(3, { multiply: 5 }),
          APP: d6(3, { multiply: 5 }),
          INT: d6(2, { add: 6, multiply: 5 }),
          POW: d6(3, { multiply: 5 }),
          EDU: d6(2, { add: 6, multiply: 5 }),
        };
        const Luck = d6(3, { multiply: 5 });
        const character = {
          Name: expr.name ?? "New Character",
          Data: {
            Characteristics: {},
            Skills: {},
            Stats: { Luck: Luck.total },
          },
        };
        for (const [char, { total }] of Object.entries(characteristics)) {
          character.Data.Characteristics[char] = total;
        }
        const id = await DB.createCharacter(
          msg.guild.id,
          msg.author.id,
          character.Name,
          JSON.stringify(character.Data)
        );
        msg.reply({
          content: `Created a new character named ${expr.name}!`,
          embeds: [
            new Discord.MessageEmbed({
              title: `Rolled stats for ${character.Name}!`,
              fields: Object.entries({ ...characteristics, Luck }).map(
                ([key, value]) => {
                  return {
                    name: key,
                    value: `${value.display} = ${value.total}`,
                    inline: true,
                  };
                }
              ),
            }),
          ],
        });
        break;
      case "edit character": {
        const character = await getCurrentCharacter(msg, expr);
        if (!character) return replyNoCharacter();
        msg.reply(getEditMessage(game, character));
        break;
      }
      case "rename character": {
        const character = await getCurrentCharacter(msg, expr);
        if (!character) return replyNoCharacter();
        const oldName = character.Name;
        character.Name = expr.name;
        await DB.updateCharacterName(character.CharacterId, character.Name);
        msg.reply(`Renamed ${oldName} to ${character.Name}`);
        break;
      }
      case "delete character": {
        const character = await getCurrentCharacter(msg, expr);
        if (!character) return replyNoCharacter();
        if (character.Name === expr.name) {
          DB.deleteCharacter(character.CharacterId);
        }
        msg.reply(`${character.Name} has been deleted.`);
        break;
      }
      case "list server characters":
        {
          const characters = await DB.listCharacters(msg.guild.id);
          if (!characters.length) return replyNoCharacter();
          const details = characters.map(
            (character) =>
              `**${character.Name}**
${listStats(character)}
${Object.entries(character.Data.Characteristics)
  .map(([char, value]) => `${char}: ${value}`)
  .join(", ")}
Skills: ${listSkills(game, character)}`
          );
          msg.reply(
            `Here are all the characters on the server:

${details.join("\n\n")}`
          );
        }
        break;
      case "list characters": {
        const characters = await DB.listCharacters(msg.guild.id, msg.author.id);
        if (!characters.length) return replyNoCharacter();
        msg.reply(
          `Here are your characters: ${characters
            .map((it) => it.Name)
            .join(", ")}`
        );
        break;
      }
      case "skill roll": {
        const character = await getCurrentCharacter(msg, expr);
        if (!character) return replyNoCharacter();
        const bonus = expr.bonus - expr.penalty;
        const modifiers =
          bonus > 0
            ? `, Bonus: ${bonus}`
            : bonus < 0
            ? `, Penalty: ${-bonus}`
            : "";
        const { error, value, skill } = await getSkillClarify(
          msg,
          game,
          character,
          expr.skill
        );
        if (error) {
          return;
        }
        const { message, result } = check(value, bonus);
        msg.reply(
          `${character.Name} attempts ${skill} (${value}%${modifiers})!
${message}; **${result}!**`
        );
        break;
      }
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
        msg.reply(
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
        msg.reply(`${result.display} = ${result.total}`);
        break;
      }
      case "hp": {
        const character = await getCurrentCharacter(msg, expr);
        if (!character) return replyNoCharacter();
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
        msg.reply(`${character.Name}'s HP: ${display}`);
        break;
      }
      case "sanity": {
        const character = await getCurrentCharacter(msg, expr);
        if (!character) return replyNoCharacter();
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
        msg.reply(`${character.Name}'s Sanity: ${display}`);
        break;
      }
      case "luck": {
        const character = await getCurrentCharacter(msg, expr);
        if (!character) return replyNoCharacter();
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
        msg.reply(`${character.Name}'s Luck: ${display}`);
        break;
      }
      case "mark": {
        const character = await getCurrentCharacter(msg, expr);
        if (!character) return replyNoCharacter();
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
        msg.reply(
          error ??
            `${character.Name}'s skill, ${skill} (${value}%) is marked for improvement!`
        );
        break;
      }
      case "reset mark": {
        const character = await getCurrentCharacter(msg, expr);
        if (!character) return replyNoCharacter();
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
        msg.reply(
          error ??
            `${character.Name}'s skill, ${skill} (${value}%) is not marked for improvement!`
        );
        break;
      }
      case "improve": {
        const character = await getCurrentCharacter(msg, expr);
        if (!character) return replyNoCharacter();
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
            msg.reply(error);
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
          if (!success) {
            display = `Improvement: ${improve(game, character, skill).display}`;
          }
          results.push(`**${skill} (${value}%)**: ${message}
${display}`);
        }
        character.Data.Improvements = character.Data.Improvements.filter(
          (it) => !improvements.includes(it)
        );
        await DB.updateCharacterData(character.CharacterId, character.Data);

        msg.reply(results.join("\n\n") || `No skills marked for improvement.`);
        break;
      }
      case "stats": {
        const character = await getCurrentCharacter(msg, expr);
        if (!character) return replyNoCharacter();
        msg.reply(`**${character.Name}** ${listStats(character)}`);
        break;
      }
      case "set skill": {
        const character = await getCurrentCharacter(msg, expr);
        if (!character) return replyNoCharacter();
        const { skill, error } = expr.custom
          ? { skill: expr.skill }
          : await getSkillClarify(msg, game, character, expr.skill);
        if (error) {
          msg.reply(error);
          break;
        }
        character.Data.Skills[skill] = Math.min(99, Math.max(0, expr.value));
        await DB.updateCharacterData(character.CharacterId, character.Data);
        msg.reply(listSkills(game, character));
        break;
      }
      case "reset skill": {
        const character = await getCurrentCharacter(msg, expr);
        if (!character) return replyNoCharacter();
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
        msg.reply(listSkills(game, character));
        break;
      }
      case "sheet": {
        const character = await getCurrentCharacter(msg, expr);
        if (!character) return replyNoCharacter();
        msg.reply(
          `**${character.Name}**
Stats: ${listStats(character)}
Skills: ${listSkills(game, character)}`
        );
        break;
      }
      case "help": {
        const helpText = await loadFile(`help/${expr.help}.md`);
        msg.reply(helpText);
        break;
      }
      default:
        msg.reply(
          `I'm sorry, I don't understand "${expr.command}". Kyle will probably teach me soon.`
        );
        break;
    }
  } catch (e) {
    msg.reply(
      `:head_bandage: I'm really sorry, but something has gone terribly wrong.`
    );
    console.error("Failed to process message", e);
  }
});
