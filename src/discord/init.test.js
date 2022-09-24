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
      return { ServerId: "1337", Data: { Mark: "Auto" } };
    }),
    updateServerSettings: jest.fn(),
    createCharacter: jest.fn(),
    deleteCharacter: jest.fn(),
    getCharacter: jest.fn(),
    listCharacters: jest.fn(),
    updateCharacterData: jest.fn(),
    updateCharacterName: jest.fn(),
    updateCharacterIsNpc: jest.fn()
  };
});

require("./cocoaClient");
require("./message");

const dummyCharacters = [
  {
    CharacterId: uuid(),
    Name: "Podgy",
    Data: {
      Characteristics: {
        STR: 50,
        CON: 80,
        DEX: 30,
        INT: 50,
        SIZ: 60,
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
  },
  {
    CharacterId: uuid(),
    Name: "Scrawny",
    Data: {
      Characteristics: {
        STR: 50,
        CON: 30,
        DEX: 80,
        INT: 50,
        SIZ: 30,
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
  },
  {
    CharacterId: uuid(),
    Name: "Nimble",
    Data: {
      Characteristics: {
        STR: 60,
        CON: 50,
        DEX: 80,
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
  },
];

test(`"init" rolls initiative`, async () => {
  jest.spyOn(Math, "random").mockImplementation(() => 0.4);
  DB.listCharacters.mockImplementationOnce(() => dummyCharacters);

  const message = new MockMessage("init");
  await eventHandlers["messageCreate"](message);
  expect(DB.listCharacters).toHaveBeenCalled();
  expect(message.reply.mock.lastCall[0]).toEqual(`Rolling initiative!
**Scrawny** (Init 80, Move 2)
CON (30%): 1d% (40) + 1d10 (4) = 44; Move:  - 1
Move: 9 - 1 = 8 -> 2 movement actions / round

**Nimble** (Init 80, Move 3)
CON (50%): 1d% (40) + 1d10 (4) = 44
Move: 9 = 9 -> 3 movement actions / round

**Podgy** (Init 30, Move 1)
CON (80%): 1d% (40) + 1d10 (4) = 44
Move: 7 = 7 -> 1 movement action / round`);
});
