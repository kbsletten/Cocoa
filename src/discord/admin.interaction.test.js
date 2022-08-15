const DB = require("../db");
const MockInteraction = require("../mocks/mockInteraction");

const eventHandlers = {};
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
      return {
        ServerId: "1337",
        Data: {},
      };
    }),
    updateServerSettings: jest.fn(),
    createCharacter: jest.fn(),
    getCharacter: jest.fn(),
    getCharacterById: jest.fn(),
    deleteCharacter: jest.fn(),
    listCharacters: jest.fn(),
    updateCharacterData: jest.fn(),
  };
});
jest;

require("./cocoaClient");
require("./admin.interaction");

test("cocoa is nobody's fool", async () => {
  const consoleLogFn = jest.spyOn(global.console, "log");

  const interaction = new MockInteraction(`admin:serverSettings:Game`, [
    "KIDS",
  ]);
  await eventHandlers["interactionCreate"](interaction);
  expect(consoleLogFn).toHaveBeenCalledWith(`I'm not listening.`);
});

test("'admin:serverSettings:Game' changes the game", async () => {
  const interaction = new MockInteraction(
    `admin:serverSettings:Game`,
    ["KIDS"],
    true
  );
  await eventHandlers["interactionCreate"](interaction);
  expect(DB.getServerSettings).toHaveBeenCalled();
  expect(DB.updateServerSettings).toHaveBeenCalledWith("1337", {
    Game: "KIDS",
  });
});
