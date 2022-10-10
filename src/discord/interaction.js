const Discord = require("discord.js");
const { GAMES, CHARACTERISTICS, getDefaults } = require("../coc/data");
const { improve } = require("../coc/game");
const { cocoaClient } = require("./cocoaClient");
const DB = require("../db");
const { getEditMessage } = require("./getEditMessage");
const { choiceCallback } = require("./choice");
const commands = require("./commands");
const parser = require("../parser/command.gen");

cocoaClient.on("interactionCreate", async (interaction) => {
  if (interaction.isCommand()) {
    const Command = commands[interaction.commandName];
    if (Command) {
      const expr = {};
      for (const option of Command.getOptions()) {
        const value = interaction.options.get(option.name, option.required);
        if (value) {
          expr[value.name] = value.value;
        }
      }
      await new Command(interaction, expr, DB).process();
      return;
    } else if (interaction.commandName === "cocoa") {
      let expr;
      try {
        expr = parser.parse(interaction.options.getString("command"));
      } catch (e) {
        await interaction.reply(
          `I'm sorry, I didn't understand what you meant.`
        );
        return;
      }
      const Command = commands[expr.command];
      if (Command) {
        await new Command(interaction, expr, DB).process();
      } else {
        await interaction.reply(
          `I'm sorry, I don't understand "${expr.command}". Kyle will probably teach me soon.`
        );
      }
    }
    return;
  }
  const serverSettings = await DB.getServerSettings(interaction.guild.id);
  const game = GAMES[serverSettings.Data["Game"] ?? "CORE"];
  try {
    const [command, id, operation, value] = interaction.customId.split(":", 4);
    switch (command) {
      case "editCharacter": {
        const character = await DB.getCharacterById(id);
        switch (operation) {
          case "characteristic": {
            interaction.update(
              getEditMessage(
                game,
                character,
                interaction.isSelectMenu() ? interaction.values[0] : value
              )
            );
            break;
          }
          case "skillPage": {
            interaction.update(
              getEditMessage(game, character, undefined, parseInt(value))
            );
            break;
          }
          case "skill": {
            interaction.update(
              getEditMessage(
                game,
                character,
                undefined,
                undefined,
                interaction.isSelectMenu() ? interaction.values[0] : value
              )
            );
            break;
          }
          default: {
            switch (value) {
              case "improve": {
                const { display } = improve(game, character, operation);
                await DB.updateCharacterData(
                  character.CharacterId,
                  character.Data
                );
                interaction.update({
                  components: [],
                  embeds: [
                    new Discord.MessageEmbed({
                      title: `Improved ${character.Name}'s ${operation}!`,
                      fields: [
                        {
                          name: operation,
                          value: display,
                        },
                      ],
                    }),
                  ],
                });
                break;
              }
              default:
                {
                  const defaults = getDefaults(game, character);
                  const isCharacteristic = CHARACTERISTICS.includes(operation);
                  const pool = isCharacteristic
                    ? character.Data.Characteristics
                    : character.Data.Skills;
                  const oldValue = isNaN(pool[operation])
                    ? defaults[operation] ?? 0
                    : pool[operation];
                  const newValue = interaction.isSelectMenu()
                    ? Number(interaction.values[0])
                    : Math.min(
                        99,
                        Math.max(
                          0,
                          (isNaN(oldValue) ? 0 : oldValue) +
                            {
                              plusFive: 5,
                              plusOne: 1,
                              minusFive: -5,
                              minusOne: -1,
                            }[value]
                        )
                      );
                  pool[operation] = newValue;
                  await DB.updateCharacterData(
                    character.CharacterId,
                    character.Data
                  );
                  interaction.update(
                    getEditMessage(
                      game,
                      character,
                      isCharacteristic ? operation : undefined,
                      undefined,
                      isCharacteristic ? undefined : operation
                    )
                  );
                }
                break;
            }
            break;
          }
        }
        break;
      }
      case "callback": {
        choiceCallback(id, interaction);
        break;
      }
    }
  } catch (e) {
    console.error(`Failed to process interaction`, e);
  }
});
