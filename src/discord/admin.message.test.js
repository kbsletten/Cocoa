const Discord = require("discord.js");
const DB = require("../db");
const MockMessage = require("../mocks/mockMessage");

const eventHandlers = {};
const dummySettings = { ServerId: "1337", Data: {} };
jest.mock("../discord/cocoaClient", () => {
  return {
    cocoaClient: {
      on: function (name, callback) {
        eventHandlers[name] = callback;
      },
    },
  };
});
jest.mock("../db", () => {
  return {
    getServerSettings: jest.fn(() => {
      return dummySettings;
    }),
    updateServerSettings: jest.fn(),
    createCharacter: jest.fn(),
    deleteCharacter: jest.fn(),
    getCharacter: jest.fn(),
    listCharacters: jest.fn(),
    updateCharacterData: jest.fn(),
    updateCharacterName: jest.fn(),
  };
});

require("./cocoaClient");
require("./admin.message");

test("cocoa doesn't talk to strangers", async () => {
  const consoleLogFn = jest.spyOn(global.console, "log");

  const message = new MockMessage("Hi, Cocoa!", true);
  await eventHandlers["messageCreate"](message);
  expect(message.reply).not.toHaveBeenCalled();
  expect(consoleLogFn).toHaveBeenCalledWith("Hello, fellow bot!");
});

test("cocoa ignores the haters", async () => {
  const message = new MockMessage("Hi, Cocoa!");
  await eventHandlers["messageCreate"](message);
  expect(message.reply).not.toHaveBeenCalled();
});

test("cocoa is nobody's fool", async () => {
  const consoleLogFn = jest.spyOn(global.console, "log");

  const message = new MockMessage("admin server settings");
  await eventHandlers["messageCreate"](message);
  expect(consoleLogFn).toHaveBeenCalledWith(`I'm not listening.`);
});

test("'admin sever settings' displays a menu", async () => {
  const message = new MockMessage("admin server settings", false, true);
  await eventHandlers["messageCreate"](message);
  expect(DB.getServerSettings).toHaveBeenCalled();
  expect(message.reply).toHaveBeenCalledWith({
    content: `Editing server settings...`,
    components: [
      new Discord.MessageActionRow({
        components: [
          new Discord.MessageSelectMenu({
            custom_id: "admin:serverSettings:Game",
            disabled: false,
            max_values: undefined,
            min_values: null,
            options: [
              {
                default: false,
                description: null,
                emoji: null,
                label: "Game: CORE",
                value: "CORE",
              },
              {
                default: false,
                description: null,
                emoji: null,
                label: "Game: MODERN",
                value: "MODERN",
              },
              {
                default: false,
                description: null,
                emoji: null,
                label: "Game: KIDS",
                value: "KIDS",
              },
            ],
            placeholder: "Choose game",
          }),
        ],
      }),
      new Discord.MessageActionRow({
        components: [
          new Discord.MessageSelectMenu({
            custom_id: "admin:serverSettings:Karma",
            disabled: false,
            max_values: undefined,
            min_values: null,
            options: [
              {
                default: false,
                description: null,
                emoji: null,
                label: "Karma: On",
                value: "On",
              },
              {
                default: false,
                description: null,
                emoji: null,
                label: "Karma: Off",
                value: "Off",
              },
            ],
            placeholder: "Enable karmic rerolls",
          }),
        ],
      }),
    ],
  });
});

test("'admin channel' updates the admin channel", async () => {
  const message = new MockMessage("admin channel", false, true);
  await eventHandlers["messageCreate"](message);
  expect(DB.getServerSettings).toHaveBeenCalled();
  expect(dummySettings.Data.AdminChannel).toBe(message.channel.id);
  expect(DB.updateServerSettings).toHaveBeenCalled();
  expect(message.reply).toHaveBeenCalledWith(
    `You will receive admin messages in this channel.`
  );
});
