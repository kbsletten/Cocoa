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
    listNpcs: jest.fn(),
    updateCharacterData: jest.fn(),
    updateCharacterName: jest.fn(),
    updateCharacterIsNpc: jest.fn(),
  };
});

require("./cocoaClient");
require("./message");

const dummyCharacter = {
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
};

const dummyCharacters = [
  dummyCharacter,
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

test("'set npc on' turns the character into an npc", async () => {
  DB.getCharacter.mockImplementationOnce(async () => dummyCharacter);

  const message = new MockMessage("set npc on");
  await eventHandlers["messageCreate"](message);
  expect(DB.getCharacter).toHaveBeenCalled();
  expect(dummyCharacter.IsNpc).toBe(true);
  expect(DB.updateCharacterIsNpc).toHaveBeenCalled();
  expect(DB.updateCharacterData).not.toHaveBeenCalled();
  expect(message.reply).toHaveBeenCalled();
});

test("'set npc no' turns the character into a pc", async () => {
  DB.getCharacter.mockImplementationOnce(async () => dummyCharacter);

  const message = new MockMessage("set npc no");
  await eventHandlers["messageCreate"](message);
  expect(DB.getCharacter).toHaveBeenCalled();
  expect(dummyCharacter.IsNpc).toBe(false);
  expect(DB.updateCharacterIsNpc).toHaveBeenCalled();
  expect(DB.updateCharacterData).not.toHaveBeenCalled();
  expect(message.reply).toHaveBeenCalled();
});

test("'list npcs' lists all the NPCs in the server", async () => {
  DB.listNpcs.mockImplementationOnce(async () => dummyCharacters);

  const message = new MockMessage("list npcs");
  await eventHandlers["messageCreate"](message);
  expect(DB.listNpcs).toHaveBeenCalled();
  expect(message.reply)
    .toHaveBeenCalledWith(`Here are all the NPCs on the server:

**Podgy**
HP: 14/14, Luck: 75/99, MP: 10/10, Sanity: 50/99
STR: 50, CON: 80, DEX: 30, INT: 50, SIZ: 60, POW: 50, APP: 50, EDU: 50
Skills: Not set

**Scrawny**
HP: 6/6, Luck: 75/99, MP: 10/10, Sanity: 50/99
STR: 50, CON: 30, DEX: 80, INT: 50, SIZ: 30, POW: 50, APP: 50, EDU: 50
Skills: Not set

**Nimble**
HP: 10/10, Luck: 75/99, MP: 10/10, Sanity: 50/99
STR: 60, CON: 50, DEX: 80, INT: 50, SIZ: 50, POW: 50, APP: 50, EDU: 50
Skills: Not set`);
});
