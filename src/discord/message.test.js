const Discord = require("discord.js");
const DB = require("../db/character");
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
jest.mock("../db/character", () => {
  return {
    createCharacter: jest.fn(),
    getCharacter: jest.fn(),
    deleteCharacter: jest.fn(),
    listCharacters: jest.fn(),
    updateCharacterData: jest.fn(),
  };
});
jest;

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

test("cocoa doesn't talk to strangers", async () => {
  const consoleLogFn = jest.spyOn(global.console, "log");

  const newCharacterMessage = new MockMessage("Hi, Cocoa!", true);
  await eventHandlers["messageCreate"](newCharacterMessage);
  expect(newCharacterMessage.reply).not.toHaveBeenCalled();
  expect(consoleLogFn).toHaveBeenCalledWith("Hello, fellow bot!");
});

test("cocoa ignores the haters", async () => {
  const newCharacterMessage = new MockMessage("Hi, Cocoa!");
  await eventHandlers["messageCreate"](newCharacterMessage);
  expect(newCharacterMessage.reply).not.toHaveBeenCalled();
});

test("'new character' creates a character", async () => {
  jest.spyOn(global.Math, "random").mockImplementation(() => 0.9);

  const newCharacterMessage = new MockMessage("new character");
  await eventHandlers["messageCreate"](newCharacterMessage);
  expect(DB.createCharacter).toHaveBeenCalled();
  expect(newCharacterMessage.reply.mock.lastCall[0].embeds).toEqual([
    new Discord.MessageEmbed({
      title: "Rolled stats for New Character!",
      fields: [
        {
          inline: true,
          name: "STR",
          value: "3d6 (6, 6, 6) * 5 = 90",
        },
        {
          inline: true,
          name: "CON",
          value: "3d6 (6, 6, 6) * 5 = 90",
        },
        {
          inline: true,
          name: "SIZ",
          value: "(2d6 (6, 6) + 6) * 5 = 90",
        },
        {
          inline: true,
          name: "DEX",
          value: "3d6 (6, 6, 6) * 5 = 90",
        },
        {
          inline: true,
          name: "APP",
          value: "3d6 (6, 6, 6) * 5 = 90",
        },
        {
          inline: true,
          name: "INT",
          value: "(2d6 (6, 6) + 6) * 5 = 90",
        },
        {
          inline: true,
          name: "POW",
          value: "3d6 (6, 6, 6) * 5 = 90",
        },
        {
          inline: true,
          name: "EDU",
          value: "(2d6 (6, 6) + 6) * 5 = 90",
        },
        {
          inline: true,
          name: "Luck",
          value: "3d6 (6, 6, 6) * 5 = 90",
        },
      ],
    }),
  ]);
});

test("'edit character' creates an interactive modal", async () => {
  DB.getCharacter.mockImplementationOnce(async () => dummyCharacter);

  const newCharacterMessage = new MockMessage("edit character");
  await eventHandlers["messageCreate"](newCharacterMessage);
  expect(DB.getCharacter).toHaveBeenCalled();
  expect(newCharacterMessage.reply).toHaveBeenCalled();
});

test("'delete character Real Character' doesn't delete the character", async () => {
  DB.getCharacter.mockImplementationOnce(async () => dummyCharacter);

  const newCharacterMessage = new MockMessage(
    "delete character Real Character"
  );
  await eventHandlers["messageCreate"](newCharacterMessage);
  expect(DB.getCharacter).toHaveBeenCalled();
  expect(DB.deleteCharacter).not.toHaveBeenCalled();
  expect(newCharacterMessage.reply).toHaveBeenCalled();
});

test("'delete character Dummy Character' deletes the character", async () => {
  DB.getCharacter.mockImplementationOnce(async () => dummyCharacter);

  const newCharacterMessage = new MockMessage(
    "delete character Dummy Character"
  );
  await eventHandlers["messageCreate"](newCharacterMessage);
  expect(DB.getCharacter).toHaveBeenCalled();
  expect(DB.deleteCharacter).toHaveBeenCalled();
  expect(newCharacterMessage.reply).toHaveBeenCalled();
});

test("'list server characters' lists the characters on the server", async () => {
  DB.listCharacters.mockImplementationOnce(async () => [dummyCharacter]);

  const newCharacterMessage = new MockMessage("list server characters");
  await eventHandlers["messageCreate"](newCharacterMessage);
  expect(DB.listCharacters).toHaveBeenCalled();
  expect(newCharacterMessage.reply)
    .toHaveBeenCalledWith(`Here are all the characters on the server:

**Dummy Character**
HP: 10/10, Luck: 75/99, Sanity: 50/99
STR: 50, CON: 50, DEX: 50, INT: 50, SIZ: 50, POW: 50, APP: 50, EDU: 50
Skills: Not set`);
});

test("'list characters' lists your characters on the server", async () => {
  DB.listCharacters.mockImplementationOnce(async () => [dummyCharacter]);

  const newCharacterMessage = new MockMessage("list characters");
  await eventHandlers["messageCreate"](newCharacterMessage);
  expect(DB.listCharacters).toHaveBeenCalled();
  expect(newCharacterMessage.reply).toHaveBeenCalledWith(
    `Here are your characters: Dummy Character`
  );
});

test("'skill Listen 70' sets a character's listen to 70", async () => {
  DB.getCharacter.mockImplementationOnce(async () => dummyCharacter);

  const newCharacterMessage = new MockMessage("skill Listen 70");
  await eventHandlers["messageCreate"](newCharacterMessage);
  expect(DB.getCharacter).toHaveBeenCalled();
  expect(dummyCharacter.Data.Skills.Listen).toBe(70);
  expect(DB.updateCharacterData).toHaveBeenCalled();
  expect(newCharacterMessage.reply).toHaveBeenCalled();
});

test("'check 70 Listen penalty' succeeds on 69", async () => {
  DB.getCharacter.mockImplementationOnce(async () => dummyCharacter);
  jest
    .spyOn(global.Math, "random")
    .mockImplementationOnce(() => 0.9)
    .mockImplementationOnce(() => 0.6)
    .mockImplementationOnce(() => 0.3);

  const newCharacterMessage = new MockMessage("check 70 Listen penalty");
  await eventHandlers["messageCreate"](newCharacterMessage);
  expect(DB.getCharacter).toHaveBeenCalled();
  expect(newCharacterMessage.reply)
    .toHaveBeenCalledWith(`Dummy Character attempts Listen (70%, Penalty: 1)!
2d% (60, 30) + 1d10 (9) = 69; **Success!**`);
});

test("'check 70 Listen bonus' fails on 70", async () => {
  DB.getCharacter.mockImplementationOnce(async () => null);
  jest
    .spyOn(global.Math, "random")
    .mockImplementationOnce(() => 0.0)
    .mockImplementationOnce(() => 0.6)
    .mockImplementationOnce(() => 0.9);

  const newCharacterMessage = new MockMessage("check 70 Listen bonus");
  await eventHandlers["messageCreate"](newCharacterMessage);
  expect(DB.getCharacter).toHaveBeenCalled();
  expect(newCharacterMessage.reply)
    .toHaveBeenCalledWith(`Test Nickname attempts Listen (70%, Bonus: 1)!
2d% (70, 100) + 1d10 (0) = 70; **Success!**`);
});

test("'check 70 Listen' fails on 71", async () => {
  DB.getCharacter.mockImplementationOnce(async () => null);
  jest
    .spyOn(global.Math, "random")
    .mockImplementationOnce(() => 0.1)
    .mockImplementationOnce(() => 0.7);

  const newCharacterMessage = new MockMessage("check 70 Listen");
  await eventHandlers["messageCreate"](newCharacterMessage);
  expect(DB.getCharacter).toHaveBeenCalled();
  expect(newCharacterMessage.reply)
    .toHaveBeenCalledWith(`Test Nickname attempts Listen (70%)!
1d% (70) + 1d10 (1) = 71; **Failure!**`);
});

test("'skill Listen' succeeds on 69", async () => {
  DB.getCharacter.mockImplementationOnce(async () => dummyCharacter);
  jest
    .spyOn(global.Math, "random")
    .mockImplementationOnce(() => 0.9)
    .mockImplementationOnce(() => 0.6);

  const newCharacterMessage = new MockMessage("skill Listen");
  await eventHandlers["messageCreate"](newCharacterMessage);
  expect(DB.getCharacter).toHaveBeenCalled();
  expect(newCharacterMessage.reply)
    .toHaveBeenCalledWith(`Dummy Character attempts Listen (70%)!
1d% (60) + 1d10 (9) = 69; **Success!**`);
});

test("'skill Listen bonus' succeeds on 70", async () => {
  DB.getCharacter.mockImplementationOnce(async () => dummyCharacter);
  jest
    .spyOn(global.Math, "random")
    .mockImplementationOnce(() => 0.0)
    .mockImplementationOnce(() => 0.6)
    .mockImplementationOnce(() => 0.8);

  const newCharacterMessage = new MockMessage("skill Listen bonus");
  await eventHandlers["messageCreate"](newCharacterMessage);
  expect(DB.getCharacter).toHaveBeenCalled();
  expect(newCharacterMessage.reply)
    .toHaveBeenCalledWith(`Dummy Character attempts Listen (70%, Bonus: 1)!
2d% (70, 90) + 1d10 (0) = 70; **Success!**`);
});

test("'skill Listen penalty' fails on 71", async () => {
  DB.getCharacter.mockImplementationOnce(async () => dummyCharacter);
  jest
    .spyOn(global.Math, "random")
    .mockImplementationOnce(() => 0.1)
    .mockImplementationOnce(() => 0.7)
    .mockImplementationOnce(() => 0.3);

  const newCharacterMessage = new MockMessage("skill Listen penalty");
  await eventHandlers["messageCreate"](newCharacterMessage);
  expect(DB.getCharacter).toHaveBeenCalled();
  expect(newCharacterMessage.reply)
    .toHaveBeenCalledWith(`Dummy Character attempts Listen (70%, Penalty: 1)!
2d% (70, 30) + 1d10 (1) = 71; **Failure!**`);
});

test("'r 3d6 * 5' rolls three d6s", async () => {
  jest.spyOn(global.Math, "random").mockImplementation(() => 0.1);

  const newCharacterMessage = new MockMessage("r 3d6 * 5");
  await eventHandlers["messageCreate"](newCharacterMessage);
  expect(newCharacterMessage.reply).toHaveBeenCalledWith(
    `3d6 (1, 1, 1) * 5 = 15`
  );
});

test("'hp -5' reduces the HP by 5", async () => {
  DB.getCharacter.mockImplementationOnce(async () => dummyCharacter);

  const newCharacterMessage = new MockMessage("hp -5");
  await eventHandlers["messageCreate"](newCharacterMessage);
  expect(DB.getCharacter).toHaveBeenCalled();
  expect(DB.updateCharacterData).toHaveBeenCalled();
  expect(newCharacterMessage.reply).toHaveBeenCalledWith(
    `Dummy Character's HP: 5/10 (-5)`
  );
});

test("'hp +2' increases the HP by 2", async () => {
  DB.getCharacter.mockImplementationOnce(async () => dummyCharacter);

  const newCharacterMessage = new MockMessage("hp +2");
  await eventHandlers["messageCreate"](newCharacterMessage);
  expect(DB.getCharacter).toHaveBeenCalled();
  expect(DB.updateCharacterData).toHaveBeenCalled();
  expect(newCharacterMessage.reply).toHaveBeenCalledWith(
    `Dummy Character's HP: 7/10 (+2)`
  );
});

test("'hp 11' sets the HP to 10", async () => {
  DB.getCharacter.mockImplementationOnce(async () => dummyCharacter);

  const newCharacterMessage = new MockMessage("hp 11");
  await eventHandlers["messageCreate"](newCharacterMessage);
  expect(DB.getCharacter).toHaveBeenCalled();
  expect(DB.updateCharacterData).toHaveBeenCalled();
  expect(newCharacterMessage.reply).toHaveBeenCalledWith(
    `Dummy Character's HP: 10/10 (+3)`
  );
});

test("'san 10' sets the sanity to 10", async () => {
  DB.getCharacter.mockImplementationOnce(async () => dummyCharacter);

  const newCharacterMessage = new MockMessage("san 10");
  await eventHandlers["messageCreate"](newCharacterMessage);
  expect(DB.getCharacter).toHaveBeenCalled();
  expect(DB.updateCharacterData).toHaveBeenCalled();
  expect(newCharacterMessage.reply).toHaveBeenCalledWith(
    `Dummy Character's Sanity: 10/99 (-40)`
  );
});

test("'luck 10' sets the luck to 10", async () => {
  DB.getCharacter.mockImplementationOnce(async () => dummyCharacter);

  const newCharacterMessage = new MockMessage("luck 10");
  await eventHandlers["messageCreate"](newCharacterMessage);
  expect(DB.getCharacter).toHaveBeenCalled();
  expect(DB.updateCharacterData).toHaveBeenCalled();
  expect(newCharacterMessage.reply).toHaveBeenCalledWith(
    `Dummy Character's Luck: 10/99 (-65)`
  );
});

test("'mark Listen' marks the Listen skill for improvement", async () => {
  DB.getCharacter.mockImplementationOnce(async () => dummyCharacter);

  const newCharacterMessage = new MockMessage("mark Listen");
  await eventHandlers["messageCreate"](newCharacterMessage);
  expect(DB.getCharacter).toHaveBeenCalled();
  expect(dummyCharacter.Data.Improvements).toContain("Listen");
  expect(DB.updateCharacterData).toHaveBeenCalled();
  expect(newCharacterMessage.reply).toHaveBeenCalledWith(
    `Dummy Character's skill, Listen (70%) is marked for improvement!`
  );
});

test("'improve marked' doesn't improve Listen skill on 70", async () => {
  DB.getCharacter.mockImplementationOnce(async () => dummyCharacter);
  jest
    .spyOn(global.Math, "random")
    .mockImplementationOnce(() => 0.0)
    .mockImplementationOnce(() => 0.6);

  const newCharacterMessage = new MockMessage("improve Listen");
  await eventHandlers["messageCreate"](newCharacterMessage);
  expect(DB.getCharacter).toHaveBeenCalled();
  expect(dummyCharacter.Data.Skills.Listen).toBe(70);
  expect(dummyCharacter.Data.Improvements).not.toContain("Listen");
  expect(DB.updateCharacterData).toHaveBeenCalled();
  expect(newCharacterMessage.reply).toHaveBeenCalledWith(
    `**Listen**: 1d% (70) + 1d10 (0) = 70
No improvement.`
  );
});

test("'improve Listen' improves the Listen skill on 71", async () => {
  DB.getCharacter.mockImplementationOnce(async () => dummyCharacter);
  jest
    .spyOn(global.Math, "random")
    .mockImplementationOnce(() => 0.1)
    .mockImplementationOnce(() => 0.7)
    .mockImplementationOnce(() => 0.3);

  const newCharacterMessage = new MockMessage("improve Listen");
  await eventHandlers["messageCreate"](newCharacterMessage);
  expect(DB.getCharacter).toHaveBeenCalled();
  expect(dummyCharacter.Data.Skills.Listen).toBe(74);
  expect(DB.updateCharacterData).toHaveBeenCalled();
  expect(newCharacterMessage.reply).toHaveBeenCalledWith(
    `**Listen**: 1d% (70) + 1d10 (1) = 71
Improvement: 70 + 1d10 (4) = 74`
  );
});

test("'stats' displays your stats", async () => {
  DB.getCharacter.mockImplementationOnce(async () => dummyCharacter);
  const newCharacterMessage = new MockMessage("stats");
  await eventHandlers["messageCreate"](newCharacterMessage);
  expect(DB.getCharacter).toHaveBeenCalled();
  expect(newCharacterMessage.reply).toHaveBeenCalledWith(
    `**Dummy Character** HP: 10/10, Luck: 10/99, Sanity: 10/99`
  );
});

test("'reset skill Listen' resets your Listen skill to the default value", async () => {
  DB.getCharacter.mockImplementationOnce(async () => dummyCharacter);
  const newCharacterMessage = new MockMessage("reset skill Listen");
  await eventHandlers["messageCreate"](newCharacterMessage);
  expect(DB.getCharacter).toHaveBeenCalled();
  expect(dummyCharacter.Data.Skills.Listen).toBe(undefined);
  expect(DB.updateCharacterData).toHaveBeenCalled();
  expect(newCharacterMessage.reply).toHaveBeenCalledWith(`Not set`);
});

test("'sheet' displays your character sheet", async() => {
    DB.getCharacter.mockImplementationOnce(async () => dummyCharacter);
    const newCharacterMessage = new MockMessage("sheet");
    await eventHandlers["messageCreate"](newCharacterMessage);
    expect(DB.getCharacter).toHaveBeenCalled();
    expect(newCharacterMessage.reply).toHaveBeenCalledWith(
      `**Dummy Character**
Stats: HP: 10/10, Luck: 10/99, Sanity: 10/99
Skills: Not set`
    );
});

for (const command of [
  "edit character",
  "delete character Dummy Character",
  "skill Listen 70",
  "skill Listen bonus",
  "list server characters",
  "list characters",
  "hp +5",
  "san -5",
  "luck 5",
  "mark Listen",
  "improve marked",
  "improve Listen",
  "stats",
  "reset skill Listen",
  "sheet"
]) {
  test(`'${command}' fails when you have no character`, async () => {
    DB.getCharacter.mockImplementationOnce(async () => null);
    DB.listCharacters.mockImplementationOnce(async () => []);
    const newCharacterMessage = new MockMessage(command);
    await eventHandlers["messageCreate"](newCharacterMessage);
    expect(newCharacterMessage.reply).toHaveBeenCalledWith(
      `Whoops! You don't have any characters yet. Try \"new character\".`
    );
  });
}
