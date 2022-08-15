const Discord = require("discord.js");
const DB = require("../db");
const MockMessage = require("../mocks/mockMessage");
const { v4: uuid } = require("uuid");

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
      return { ServerId: "1337", Data: { Game: "KIDS" } };
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
require("./message");

const dummyCharacter = {
  CharacterId: uuid(),
  Name: "Dummy Character",
  Data: {
    Characteristics: {
      STR: 50,
      CON: 50,
      DEX: 50,
      INT: 50,
      SIZ: 50,
      POW: 50,
      APP: 50,
      EDU: 50,
    },
    Improvements: [],
    Skills: {},
    Stats: {
      Luck: 75,
    },
  },
};

test("'skill Gym Class' succeeds on 19", async () => {
  DB.getCharacter.mockImplementationOnce(async () => dummyCharacter);
  jest
    .spyOn(global.Math, "random")
    .mockImplementationOnce(() => 0.9)
    .mockImplementationOnce(() => 0.1);

  const message = new MockMessage("skill Gym Class");
  await eventHandlers["messageCreate"](message);
  expect(DB.getCharacter).toHaveBeenCalled();
  expect(message.reply)
    .toHaveBeenCalledWith(`Dummy Character attempts Gym Class (20%)!
1d% (10) + 1d10 (9) = 19; **Success!**`);
});
